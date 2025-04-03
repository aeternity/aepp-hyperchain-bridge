import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { getNetworkById } from "@/utils/data/filters";
import { fromAccountsBalancesToTokenAmount } from "../utils/mappers";
import { TokenAmount } from "@/types/token";
import BigNumber from "bignumber.js";

export const useTokenBalances = () => {
  const { networkId, address, balance, currency } = useContext(WalletContext);
  const network = getNetworkById(networkId);

  const fetchAccountTokenBalances = async () => {
    const response = await fetch(
      `${network?.mdwUrl}/v3/accounts/${address}/aex9/balances?limit=100`
    );
    return await response.json();
  };

  const { isPending, data, isFetching, refetch, isFetched } = useQuery({
    queryKey: ["token-balances", networkId, address],
    queryFn: fetchAccountTokenBalances,
  });

  const nativeToken: TokenAmount = {
    address: "native",
    amount: new BigNumber(balance),
    name: `${currency.networkName} Native ${currency.symbol}`,
    decimals: BigInt(currency.decimals),
    symbol: currency.symbol,
  };
  const tokens: TokenAmount[] =
    isFetched && data
      ? [nativeToken].concat(data.data.map(fromAccountsBalancesToTokenAmount))
      : [];

  return {
    tokens,
    isPending,
    isFetching,
    refetch,
  };
};
