import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fromTransactionToBridgeEntryTx } from "../utils/mappers";
import { BridgeEntryTx } from "@/types/bridge";
import { getBridgeContractForNetwork } from "@/utils/contract/helper";
import useNetworks from "./useNetworks";
import { Network } from "@/types/network";

export default function useBridgeTransactions() {
  const { currentNetwork } = useNetworks();
  const { address } = useContext(WalletContext);

  const { data, isFetching, isFetched, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["enter-bridge-txs", currentNetwork?.id, address],
      initialPageParam: null,
      queryFn: ({ pageParam }) =>
        fetchBridgeTransactions(pageParam, currentNetwork!, address),
      getNextPageParam: (lastPage) => lastPage.next,
      enabled: !!currentNetwork && !!address,
    });

  const entries =
    isFetched && data?.pages ? data.pages.flatMap((tx) => tx.data) : [];

  return {
    entries,
    isFetching,
    isFetched,
    fetchNextPage,
    refetch,
  };
}

const fetchBridgeTransactions = async (
  pageParam: string | null,
  currentNetwork: Network,
  userAddress: string
) => {
  const query = new URLSearchParams({
    limit: "10",
    entrypoint: "enter_bridge",
    contract_id: currentNetwork.bridgeContractAddress,
    caller_id: userAddress,
  });
  const txsResponse = await (
    await fetch(
      `${currentNetwork.mdwUrl}${
        pageParam || `/v3/transactions?${query.toString()}`
      }`
    )
  ).json();

  const bridgeEntries = txsResponse.data.map(
    fromTransactionToBridgeEntryTx
  ) as BridgeEntryTx[];

  const entriesByNetwork = Object.entries(
    bridgeEntries.reduce((acc, entry) => {
      if (!acc[entry.target_network.id]) {
        acc[entry.target_network.id] = [];
      }
      acc[entry.target_network.id].push(entry);
      return acc;
    }, {} as Record<string, BridgeEntryTx[]>)
  );

  const bridgeActionCompletionChecks = (
    await Promise.all(
      entriesByNetwork.map(async ([networkId, entries]) => {
        const contract = await getBridgeContractForNetwork(networkId);
        console.log(
          `processed_exits of ${networkId}`,
          (await contract.processed_exits()).decodedResult
        );
        return (
          await contract.check_ids_processed(
            entries.map((e) => e.idx),
            networkId
          )
        ).decodedResult;
      })
    )
  ).flat();
  console.log(bridgeActionCompletionChecks);
  const data = bridgeEntries.map((entry) => {
    const is_action_completed = bridgeActionCompletionChecks.find(
      ([idx]) => entry.idx === idx
    )[1];
    return {
      ...entry,
      is_action_completed,
    } as BridgeEntryTx;
  });

  return {
    data,
    next: txsResponse.next,
  };
};
