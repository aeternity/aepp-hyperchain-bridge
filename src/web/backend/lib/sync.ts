import { DEFAULT_NETWORKS } from "@/constants/networks";
import { supabase } from "./supabase";
import { Network, NetworkWithCurrency } from "@/types/network";

import { BridgeAction, BridgeEntryTx, BridgeExitTx } from "@/types/bridge";
import { TablesInsert } from "./database.types";
import {
  fetchBridgeTransactions,
  fetchBridgeTransaction,
  getCurrency,
} from "@/utils/aeternity/mdw";
import {
  bridgeEntryTxToAction,
  enterBridgeTxToBridgeEntryTx,
  exitBridgeTxToExitRequest,
  mapBigIntsToNumbers,
} from "@/utils/data/mappers";
import { getAllNetworks } from "./utils";

export async function syncAll() {
  // TODO: check for skipped indices
  const networks = await getAllNetworks();
  await sync(networks);
}

export async function syncAction(hash: string, networkId: string) {
  const networks = await getAllNetworks();
  const networkToSync = networks.find((n) => n.id === networkId);

  if (!networkToSync) {
    console.error(`Network with ID:${networkId} not found!`);
    return;
  }

  const response = await fetchBridgeTransaction(networkToSync, hash);

  if (response.tx.function === "enter_bridge") {
    const bridgeEntryTx = enterBridgeTxToBridgeEntryTx(response);
    const currency = (await getCurrency(networkToSync))!;
    const action = await bridgeEntryTxToAction(bridgeEntryTx, {
      ...networkToSync,
      statusSucceeded: true,
      currency,
    });

    const { data, error } = await supabase
      .from("actions")
      .upsert(action)
      .select()
      .single();

    if (error) {
      console.error(
        `Error inserting action for ${networkToSync.name}: ${error.message}`
      );
      throw new Error(error.message);
    }

    return data;
  } else if (response.tx.function === "exit_bridge") {
    const bridgeExitTx = exitBridgeTxToExitRequest(response);
    return await updateActionWithExitRequest(bridgeExitTx, networkToSync);
  }
}

export async function sync(networks: Network[]) {
  const currencies = await Promise.all(networks.map(getCurrency));
  const networksAndCurrencies: NetworkWithCurrency[] = networks
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

  for await (const network of networksAndCurrencies) {
    await syncEnterTransactions(network);
    await syncExitTransactions(network);
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
    await updateActionWithExitRequest(exit, network);
  }

  if (response.next) {
    await syncExitTransactions(network, response.next);
  } else {
    console.log(`Finished syncing ${network.name}`);
  }
}

async function updateActionWithExitRequest(
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
    .eq("sourceNetworkId", exit.exitRequest.entry.source_network_id)
    .eq("entryIdx", Number(exit.exitRequest.entry.idx))
    .select()
    .single();

  if (error) {
    console.error(
      `Error updating actions for ${network.name}: ${error.message}`
    );
    throw new Error(error.message);
  }

  if (data) {
    console.log(
      `Updated idx: ${data.entryIdx} actions for ${network.name} with hash ${exit.hash}`
    );
  }

  return data;
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
    throw new Error(error.message);
  } else {
    console.log(`Inserted ${data?.length} actions for ${network.name}`);
    if (response.next) {
      await syncEnterTransactions(network, response.next);
    }
  }
}
