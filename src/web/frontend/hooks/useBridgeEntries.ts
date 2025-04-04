import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/wallet-provider";
import { TransactionsResult } from "@/types/transaction";
import { getNetworkById } from "@/utils/data/filters";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fromTransactionToBridgeEntryTx } from "../utils/mappers";
import { BridgeEntryTx } from "@/types/bridge";
import { verifyBridgeActionCompletion } from "@/utils/contract/bridge";

export default function useBridgeEntries() {
  const { networkId, address } = useContext(WalletContext);
  const queryKey = ["enter-bridge-txs", networkId, address];
  const [entries, setEntries] = useState<BridgeEntryTx[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data, isFetching, isFetched, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: null,
      queryFn: async ({
        pageParam,
      }: {
        pageParam: string | null;
      }): Promise<TransactionsResult> => {
        const network = getNetworkById(networkId)!;

        const query = new URLSearchParams({
          limit: "10",
          entrypoint: "enter_bridge",
          contract_id: network.bridgeContractAddress,
          caller_id: address,
        });
        const url = `${network.mdwUrl}${
          pageParam || `/v3/transactions?${query.toString()}`
        }`;
        const response = await fetch(url);
        return await response.json();
      },
      getNextPageParam: (lastPage) => lastPage.next,
    });

  useEffect(() => {
    if (isFetching) return;

    const fetchEntryCompletions = async () => {
      setIsLoading(true);
      const _entries =
        isFetched && data?.pages
          ? data.pages
              .flatMap((tx) => tx.data)
              .map(fromTransactionToBridgeEntryTx)
          : [];

      const results = await Promise.all(
        _entries.map(async (entry) => {
          const is_action_completed = await verifyBridgeActionCompletion(
            entry.tx_hash,
            entry.target_network.id,
            entry.source_network_id
          );
          return {
            ...entry,
            is_action_completed,
          } as BridgeEntryTx;
        })
      );
      setIsLoading(false);

      return results;
    };

    fetchEntryCompletions().then(setEntries);
  }, [data, isFetched, isFetching]);

  return {
    entries,
    isFetching: isFetching || isLoading,
    isFetched: isFetched && !isLoading,
    fetchNextPage,
    refetch,
  };
}
