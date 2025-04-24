import { BridgeEntryTx, BridgeExitTx, TokenType } from "@/types/bridge";
import { Network, NetworkBase, NetworkWithCurrency } from "@/types/network";
import { AciContractCallEncoder } from "@aeternity/aepp-calldata";
import HyperchainBridge_aci from "@/aci/HyperchainBridge.json";
import { TablesInsert } from "@/web/backend/lib/database.types";
import { getTokenMeta } from "../aeternity/node";

const bridgeEncoder = new AciContractCallEncoder(HyperchainBridge_aci);

export const mapBigIntsToNumbers = <T>(obj: any): T => {
  const result: any = {};

  for (const key in obj) {
    if (typeof obj[key] === "bigint") {
      result[key] = Number(obj[key]);
    } else if (obj[key] instanceof Array && obj[key].length == 0) {
      result[key] = obj[key];
    } else if (typeof obj[key] === "object") {
      result[key] = mapBigIntsToNumbers(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

export const mapNetworkToBase = (network: Network): NetworkBase => ({
  id: network.id,
  name: network.name,
  url: network.url,
});

export const exitBridgeTxToExitRequest = (data: any): BridgeExitTx => {
  const call = bridgeEncoder.decodeCall(
    "HyperchainBridge",
    "exit_bridge",
    data.tx.call_data
  );

  return {
    hash: data.hash,
    timestamp: data.micro_time,
    exitRequest: call.args[0],
    ok: data.tx.result === "ok",
  };
};

export const enterBridgeTxToBridgeEntryTx = (data: any): BridgeEntryTx => {
  const returnValue = data.tx.return.value;
  const token =
    returnValue[2].value.length > 1 ? returnValue[2].value[1].value : undefined;

  return {
    hash: data.hash,
    timestamp: data.micro_time,
    idx: BigInt(returnValue[0].value),
    from: returnValue[1].value,
    token,
    amount: BigInt(returnValue[3].value),
    token_type: tokenTypeFromIndex(returnValue[5].value[0]),
    target_network_id: returnValue[6].value,
    source_network_id: returnValue[7].value,
    exit_link: returnValue[4].value,
  };
};

const tokenTypeFromIndex = (index: number) => {
  switch (index) {
    case 0:
      return TokenType.Native;
    case 1:
      return TokenType.Link;
    case 2:
      return TokenType.Standard;
    default:
      throw new Error(`Unknown token type index: ${index}`);
  }
};

export async function bridgeEntryTxToAction(
  entry: BridgeEntryTx,
  networkConfig: NetworkWithCurrency
): Promise<TablesInsert<"actions">> {
  const tokenMeta = entry.token
    ? await getTokenMeta(networkConfig, entry.token)
    : networkConfig.currency;

  return {
    entryIdx: Number(entry.idx),
    entryTxHash: entry.hash,
    entryTimestamp: entry.timestamp,
    bridgeEntryData: JSON.stringify(mapBigIntsToNumbers(entry)),
    amount: Number(entry.amount),
    sourceNetworkId: entry.source_network_id,
    targetNetworkId: entry.target_network_id,
    tokenAddress: entry.token || null,
    tokenName: tokenMeta.name,
    tokenSymbol: tokenMeta.symbol,
    tokenDecimals: Number(tokenMeta.decimals),
    userAddress: entry.from,
  };
}
