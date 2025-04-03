import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { TransactionsResult } from "@/types/transaction";
import { getBridgeContractAddress, getNetworkById } from "@/utils/data/filters";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fromTransactionToBridgeEntryTx } from "../utils/mappers";

export default function useBridgeEntries() {
  const { networkId, address } = useContext(WalletContext);
  const queryKey = ["enter-bridge-txs", networkId, address];

  const { data, isFetching, isFetched, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: null,
      queryFn: async ({
        pageParam,
      }: {
        pageParam: string | null;
      }): Promise<TransactionsResult> => {
        const network = getNetworkById(networkId);
        const contract = getBridgeContractAddress(networkId);

        const query = new URLSearchParams({
          limit: "10",
          entrypoint: "enter_bridge",
          contract_id: contract as string,
          caller_id: address,
        });
        const url = `${network!.mdwUrl}${
          pageParam || `/v3/transactions?${query.toString()}`
        }`;
        const response = await fetch(url);

        return await response.json();
      },
      getNextPageParam: (lastPage) => lastPage.next,
    });

  const entries =
    isFetched && data?.pages
      ? data.pages.flatMap((tx) => tx.data).map(fromTransactionToBridgeEntryTx)
      : [];

  return {
    entries,
    isFetching,
    isFetched,
    fetchNextPage,
    refetch,
  };
}
