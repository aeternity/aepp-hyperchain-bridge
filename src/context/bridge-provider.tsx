"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { WalletContext } from "./wallet-provider";
import { getLastDeployedBridgeContract } from "@/utils/deployment";
import { Contract, ContractMethodsBase } from "@aeternity/aepp-sdk";
import { aeSdk } from "@/utils/ae-sdk";
import { networks } from "@/constants/networks";

export const BridgeContext = createContext({
  bridgeContract: undefined as Contract<ContractMethodsBase> | undefined,
  registeredNetworks: [] as Network[],
  registeredTokens: [] as Token[],
});

export default function BridgeProvider({ children }: { children: React.ReactNode }) {
  const { networkId } = useContext(WalletContext);
  const [registeredTokens, setRegisteredTokens] = useState<Token[]>([]);
  const [registeredNetworks, setRegisteredNetworks] = useState<Network[]>([]);
  const [bridgeContract, setBridgeContract] = useState<Contract<ContractMethodsBase>>();

  useEffect(() => {
    const deployment = getLastDeployedBridgeContract(networkId);
    if (!deployment) return;

    const initializeBridgeContract = async (deployment: ContractDeployment) => {
      return await Contract.initialize({
        ...aeSdk.getContext(),
        address: deployment.address,
        aci: deployment.aci,
      });
    };

    initializeBridgeContract(deployment).then(setBridgeContract);
  }, [networkId]);

  useEffect(() => {
    if (!bridgeContract) return;

    const getBridgeSettings = async () => {
      const [registeredNetworksResult, registeredTokensResult] = await Promise.all([
        bridgeContract.registered_networks(),
        bridgeContract.registered_tokens(),
      ]);

      const registeredNetworks = registeredNetworksResult.decodedResult.map(
        (networkId: string) => networks.find((n) => n.id === networkId)!,
      );
      setRegisteredNetworks(registeredNetworks);
    };

    getBridgeSettings();
  }, [bridgeContract]);

  return (
    <BridgeContext.Provider value={{ bridgeContract, registeredNetworks, registeredTokens }}>
      {children}
    </BridgeContext.Provider>
  );
}
