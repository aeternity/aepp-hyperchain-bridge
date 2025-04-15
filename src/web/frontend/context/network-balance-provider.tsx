import { TokenMeta } from "@/types/token";
import React, { createContext, useContext } from "react";
import { WalletContext } from "./wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { walletSdk } from "../utils/wallet-sdk";

export const NetworkBalanceContext = createContext({
  balance: "",
  currency: undefined as TokenMeta | undefined,
  reloadBalance: () => {},
});

export default function NetworkBalanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { networkId, address, currentNetwork } = useContext(WalletContext);

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
    <NetworkBalanceContext.Provider
      value={{
        balance,
        currency,
        reloadBalance,
      }}
    >
      {children}
    </NetworkBalanceContext.Provider>
  );
}
