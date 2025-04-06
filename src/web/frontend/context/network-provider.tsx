import { Network } from "@/types/network";
import { TokenMeta } from "@/types/token";
import React, { createContext, useContext } from "react";
import { WalletContext } from "./wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { walletSdk } from "../utils/wallet-sdk";
import useNetworks from "../hooks/useNetworks";

export const NetworkContext = createContext({
  balance: "",
  currency: undefined as TokenMeta | undefined,
  reloadBalance: () => {},
});

export default function NetworkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { networkId, address } = useContext(WalletContext);
  const { currentNetwork } = useNetworks();

  const { data: balance, refetch: reloadBalance } = useQuery({
    queryKey: ["balance", networkId, address],
    queryFn: async () => walletSdk.getBalance(address as `ak_${string}`),
    enabled: !!address && !!networkId,
    initialData: "0",
  });

  const { data: currency } = useQuery({
    queryKey: ["currency", networkId],
    queryFn: async () => {
      const response = await fetch(`${currentNetwork!.url}/v3/currency`);
      const data = await response.json();

      return {
        symbol: data.symbol,
        decimals: BigInt(Math.log10(data.subunits_per_unit)),
        name: data.network_name,
      };
    },
    enabled: !!currentNetwork,
  });
  return (
    <NetworkContext.Provider
      value={{
        balance,
        currency,
        reloadBalance,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}
