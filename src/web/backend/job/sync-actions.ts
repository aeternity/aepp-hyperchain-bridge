import WebSocket from "ws";
import { DEFAULT_NETWORKS } from "@/constants/networks";
import { supabase } from "../lib/supabase";
import { Network, NetworkWithCurrency } from "@/types/network";

import { BridgeEntryTx, BridgeExitTx } from "@/types/bridge";
import { TablesInsert } from "../lib/database.types";
import { TokenMeta } from "@/types/token";
import { fetchBridgeTransactions, getCurrency } from "@/utils/aeternity/node";
import {
  bridgeEntryTxToAction,
  enterBridgeTxToBridgeEntryTx,
  exitBridgeTxToExitRequest,
  mapBigIntsToNumbers,
} from "@/utils/data/mappers";

export default async function sync() {
  const { data: dbNetworks } = await supabase.from("networks").select("*");
  const _networks = DEFAULT_NETWORKS.concat(dbNetworks || []);
  const currencies = await Promise.all(_networks.map(getCurrency));
  const networks: NetworkWithCurrency[] = _networks
    .map((network, index) => ({
      ...network,
      currency: currencies[index]!,
      statusSucceeded: !!currencies[index],
    }))
    .filter((n) => {
      if (!n.statusSucceeded)
        console.error(`Network ${n.name} is not active! Skipping...`);
      return n.statusSucceeded;
    });

  for await (const network of networks) {
    await syncEnterTransactions(network);
    await syncExitTransactions(network);
    await listenNetwork(network);
    console.log(`Listening to ${network.name} transactions WebSocket`);
  }
}

async function syncExitTransactions(
  network: NetworkWithCurrency,
  next: string | null = null
) {
  const response = await fetchBridgeTransactions(network, "exit_bridge", next);
  const bridgeExits = response.data
    .map(exitBridgeTxToExitRequest)
    .filter((a: BridgeExitTx) => a.ok) as BridgeExitTx[];

  for await (const exit of bridgeExits) {
    await updateActionsWithExitRequest(exit, network);
  }
  if (response.next) {
    await syncExitTransactions(network, response.next);
  } else {
    console.log(`Finished syncing ${network.name}`);
  }
}

async function updateActionsWithExitRequest(
  exit: BridgeExitTx,
  network: Network
) {
  const { data, error } = await supabase
    .from("actions")
    .update({
      exitTimestamp: exit.timestamp,
      exitTxHash: exit.hash,
      exitRequestData: JSON.stringify(mapBigIntsToNumbers(exit.exitRequest)),
      isCompleted: true,
    })
    .eq("sourceNetworkId", exit.exitRequest.entry_network.id)
    .eq("entryIdx", Number(exit.exitRequest.entry.idx))
    .select();

  if (error) {
    console.error(
      `Error updating actions for ${network.name}: ${error.message}`
    );
  }
  if (data) {
    console.log(
      `Updated idx:${data[0].entryIdx} actions for ${network.name} with hash ${exit.hash}`
    );
  }
}

async function syncEnterTransactions(
  network: NetworkWithCurrency,
  next: string | null = null
) {
  const response = await fetchBridgeTransactions(network, "enter_bridge", next);
  const bridgeEntries = response.data.map(
    enterBridgeTxToBridgeEntryTx
  ) as BridgeEntryTx[];

  const actionsToInsert: TablesInsert<"actions">[] = [];
  for await (const entry of bridgeEntries) {
    actionsToInsert.push(await bridgeEntryTxToAction(entry, network));
  }

  const { data, error } = await supabase
    .from("actions")
    .upsert(actionsToInsert)
    .select();

  if (error) {
    console.error(
      `Error inserting actions for ${network.name}: ${error.message}`
    );

    console.log("Retrying...");
    await syncEnterTransactions(network, next);
  } else {
    console.log(`Inserted ${data?.length} actions for ${network.name}`);
    if (response.next) {
      await syncEnterTransactions(network, response.next);
    }
  }
}

async function handleWebSocketMessage(data: any, network: NetworkWithCurrency) {
  const { payload, source } = JSON.parse(data);
  if (source !== "mdw") return;

  if (payload.tx.function === "enter_bridge") {
    const entry = enterBridgeTxToBridgeEntryTx(payload);
    const action = await bridgeEntryTxToAction(entry, network);
    const { data, error } = await supabase
      .from("actions")
      .upsert(action)
      .select();

    if (error) {
      console.error(
        `Error processing enter_bridge transaction for ${network.name}: ${error.message}`
      );
    }
    if (data) {
      console.log(
        `Processed enter_bridge transaction for ${network.name}: ${data[0].entryIdx}`
      );
    }
  }
  if (payload.tx.function === "exit_bridge") {
    const exit = exitBridgeTxToExitRequest(payload);
    if (!exit.ok) return;

    updateActionsWithExitRequest(exit, network);
  }
}

const RETRY_INTERVAL = 2000; // 2 seconds
const retriesMap = new Map<string, number>();
const MAX_RETRIES = 5;

function listenNetwork(network: NetworkWithCurrency) {
  const client = new WebSocket(network.mdwWebSocketUrl);
  client.on("open", () => {
    retriesMap.set(network.id, 0);
    console.log(`Connected to ${network.name} WebSocket`);
    client.send(
      JSON.stringify({
        op: "Subscribe",
        payload: "Object",
        target: network.bridgeContractAddress,
      })
    );
  });
  client.on("close", () => {
    console.error(`Disconnected from ${network.name} WebSocket`);
    const retries = retriesMap.get(network.id) || 0;
    if (retries < MAX_RETRIES) {
      setTimeout(() => {
        console.log(`Reconnecting to ${network.name} WebSocket...`);
        retriesMap.set(network.id, retries + 1);
        listenNetwork(network);
      }, RETRY_INTERVAL);
    } else {
      console.error(
        `Max retries reached for ${network.name}. Stopping connection attempts.`
      );
    }
  });
  client.on("error", (error) => {
    console.error(`WebSocket error on ${network.name}: ${error.message}`);
  });

  client.on("message", (data) => {
    handleWebSocketMessage(data, network);
  });
}
