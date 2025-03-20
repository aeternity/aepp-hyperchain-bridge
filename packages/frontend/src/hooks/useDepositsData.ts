import { useContext } from "react";
import { WalletContext } from "@/context/wallet-provider";
import { TransactionsResult } from "@/utils/types";
import {
  getBridgeContractAddress,
  getNetworkById,
} from "@aepp-hyperchain-bridge/shared";
import { useInfiniteQuery } from "@tanstack/react-query";
import { transactionToDeposit } from "@/utils/mappers";
import useRegisteredTokens from "./useRegisteredTokens";

export default function useDepositsData() {
  const tokens = useRegisteredTokens();
  const { networkId, address } = useContext(WalletContext);
  const queryKey = ["deposit-transactions", networkId, address];

  const { data, isFetching, isFetched, fetchNextPage } = useInfiniteQuery({
    queryKey,
    initialPageParam: null,
    queryFn: async ({ pageParam }): Promise<TransactionsResult> => {
      const network = getNetworkById(networkId);
      const contract = getBridgeContractAddress(networkId);

      const query = new URLSearchParams({
        limit: "100",
        entrypoint: "deposit",
        contract_id: contract,
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

  const deposits =
    isFetched && !!tokens.length
      ? data.pages
          .flatMap((tx) => tx.data)
          .map(transactionToDeposit(networkId, tokens))
      : [];

  return {
    deposits,
    isFetching,
    isFetched,
    fetchNextPage,
  };
}
