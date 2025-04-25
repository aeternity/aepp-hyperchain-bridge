import WebSocket from "ws";
import { supabase } from "./supabase";
import { Network } from "@/types/network";
import { DEFAULT_NETWORKS } from "@/constants/networks";

export interface NetworkUrls {
  node: string;
  mdw: string;
  mdwWS: string;
  explorer: string;
}

export async function readURLsData(urls: NetworkUrls) {
  const { node, mdw, mdwWS, explorer } = urls;

  const [statusResp, currencyResp, mdwResp, explorerResp, isMdwWsOk] =
    await Promise.all([
      fetch(`${node}/v3/status`),
      fetch(`${node}/v3/currency`),
      fetch(`${mdw}/v3/status`),
      fetch(explorer),
      checkMdwWS(mdwWS),
    ]);
  if (!statusResp.ok) {
    throw new Error(`Node status request failed`);
  }

  if (!currencyResp.ok) {
    throw new Error(`Currency request failed`);
  }

  if (!mdwResp.ok) {
    throw new Error(`Middleware status request failed`);
  }

  if (!isMdwWsOk) {
    throw new Error(`Middleware WebSocket connection failed`);
  }

  if (!explorerResp.ok) {
    throw new Error(`Explorer request failed`);
  }

  const status = await statusResp.json();
  const currency = await currencyResp.json();
  const mdwStatus = await mdwResp.json();
  const explorerPage = await explorerResp.text();

  return {
    status,
    currency,
    mdwStatus,
    explorerPage,
    isMdwWsOk,
  };
}

export const checkMdwWS = async (url: string) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(false), 2000);
    const ws = new WebSocket(url);
    ws.on("open", () => {
      ws.send(JSON.stringify({ op: "Ping" }));
    });
    ws.on("message", (data) => {
      const { payload } = JSON.parse(data.toString());
      ws.close();
      resolve(payload === "Pong");
    });
  });
};

export async function throwWhenNetworkExists(network: Network) {
  const found = DEFAULT_NETWORKS.find(
    (n) =>
      n.id === network.id ||
      n.url === network.url ||
      n.mdwUrl === network.mdwUrl ||
      n.mdwWebSocketUrl === network.mdwWebSocketUrl
  );
  if (found) {
    throw new Error(`Network exists: ${found.name}`);
  }

  const { data, count } = await supabase
    .from("networks")
    .select("*")
    .or(
      `id.is.${network.id},url.is.${network.url},mdwUrl.is.${network.mdwUrl},mdwWebSocketUrl.is.${network.mdwWebSocketUrl}`
    );
  if (count) {
    throw new Error(`Network exists: ${data[0].name}`);
  }
}
