import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { fromAccountsBalancesToTokenAmount } from "../utils/mappers";
import { TokenAmount } from "@/types/token";
import BigNumber from "bignumber.js";
import { NetworkBalanceContext } from "../context/network-balance-provider";

export const useTokenBalances = () => {
  const { address, currentNetwork } = useContext(WalletContext);
  const { balance, currency } = useContext(NetworkBalanceContext);

  const fetchAccountTokenBalances = async () => {
    const response = await fetch(
      `${currentNetwork?.mdwUrl}/v3/accounts/${address}/aex9/balances?limit=100`
    );
    return await response.json();
  };

  const { isPending, data, isFetching, refetch, isFetched } = useQuery({
    queryKey: ["token-balances", currentNetwork?.id, address],
    queryFn: fetchAccountTokenBalances,
    enabled: !!address && !!currentNetwork,
  });

  const nativeToken =
    currency &&
    ({
      address: "native",
      amount: new BigNumber(balance),
      name: `${currency.name} Native ${currency.symbol}`,
      decimals: currency.decimals,
      symbol: currency.symbol,
    } as TokenAmount);

  const tokens: TokenAmount[] = [];
  if (nativeToken) tokens.push(nativeToken);

  if (isFetched && data) {
    tokens.push(...data.data.map(fromAccountsBalancesToTokenAmount));
  }

  return {
    tokens,
    isPending,
    isFetching,
    refetch,
  };
};
