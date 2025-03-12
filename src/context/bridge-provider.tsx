"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { WalletContext } from "./wallet-provider";
import { getLastDeployedBridgeContract } from "@/utils/contract";

export const BridgeContext = createContext({
  contractDeployment: undefined as ContractDeployment | undefined,
});

export default function BridgeProvider({ children }: { children: React.ReactNode }) {
  const { networkId } = useContext(WalletContext);
  const [contractDeployment, setContractDeployment] = useState<ContractDeployment>();

  useEffect(() => {
    setContractDeployment(getLastDeployedBridgeContract(networkId));
  }, [networkId]);

  return <BridgeContext.Provider value={{ contractDeployment }}>{children}</BridgeContext.Provider>;
}
