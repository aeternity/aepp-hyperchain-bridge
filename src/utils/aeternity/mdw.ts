import { Network } from "@/types/network";
import { TokenMeta } from "@/types/token";
import { createSdkInstance } from "./create-sdk-node";
import { getTokenMeta as _getTokenMeta } from "@/utils/contract/token";

export const getCurrency = async (
  network: Network
): Promise<TokenMeta | undefined> => {
  const url = `${network.url}/v3/currency`;
  const data = await fetch(url, { signal: AbortSignal.timeout(5000) })
    .then((res) => res.json())
    .catch((e) => console.error(e.message));
  if (!data) {
    return;
  }
  return {
    symbol: data.symbol,
    decimals: BigInt(Math.log10(data.subunits_per_unit)),
    name: `${data.network_name} Native Token`,
  };
};

export const getTokenMeta = async (
  network: Network,
  address: string
): Promise<TokenMeta> => {
  const url = `${network.mdwUrl}/v3/aex9/${address}`;
  const response = await fetch(url)
    .then((res) => res.json())
    .catch((e) => console.error(e.message));

  if (response.error) {
    const sdk = createSdkInstance(network);
    return await _getTokenMeta(sdk, address);
  }

  return {
    decimals: BigInt(response.decimals),
    symbol: response.symbol,
    name: response.name,
  };
};

export async function fetchBridgeTransactions(
  network: Network,
  entrypoint: "exit_bridge" | "enter_bridge",
  next: string | null = null
) {
  const params = new URLSearchParams({
    limit: "100",
    entrypoint,
    contract_id: network.bridgeContractAddress,
  });
  const query = next || `/v3/transactions?${params.toString()}`;
  const url = `${network.mdwUrl}${query}`;
  return await fetch(url)
    .then((res) => res.json())
    .catch((e) => console.error(e.message));
}

export async function fetchBridgeTransaction(
  network: Network,
  txHash: string,
  retries = 10
) {
  const url = `${network.mdwUrl}/v3/transactions/${txHash}`;
  const response = await fetch(url)
    .then((res) => res.json())
    .catch((e) => console.error(e.message));

  if (!response?.tx?.function && retries > 0) {
    console.warn(
      `Failed to fetch transaction ${txHash} from ${network.name}. Retrying...`
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await fetchBridgeTransaction(network, txHash, retries - 1);
  }

  return response;
}
