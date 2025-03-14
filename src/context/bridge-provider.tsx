"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { WalletContext } from "./wallet-provider";
import { BridgeContractStatus, GenericContract } from "@/types/contract";
import { aeSdk, getContract } from "@/utils/ae-sdk";
import { getBridgeContractAddress } from "@/utils/filters";
import { getRegisteredNetworksAndTokens, getTokenBalances } from "@/utils/bridge-state";

import Bridge_aci from "../../contracts/aci/HyperchainBridge.json";

export const BridgeContext = createContext({
  bridgeContract: undefined as GenericContract | undefined,
  registeredNetworks: [] as Network[],
  registeredTokens: [] as Token[],
  isLoadingInitialBridgeConfig: true,
  bridgeContractStatus: BridgeContractStatus.LOADING,
  tokenBalances: [] as TokenBalance[],
});

export default function BridgeProvider({ children }: { children: React.ReactNode }) {
  const { networkId, address } = useContext(WalletContext);
  const [registeredTokens, setRegisteredTokens] = useState<Token[]>([]);
  const [bridgeContract, setBridgeContract] = useState<GenericContract>();
  const [registeredNetworks, setRegisteredNetworks] = useState<Network[]>([]);
  const [isLoadingInitialBridgeConfig, setIsLoadingInitialBridgeConfig] = useState<boolean>(true);
  const [bridgeContractStatus, setBridgeContractStatus] = useState<BridgeContractStatus>(
    BridgeContractStatus.LOADING,
  );
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);

  useEffect(() => {
    if (!networkId) return;

    const contractAddress = getBridgeContractAddress(networkId);
    if (!contractAddress) {
      setBridgeContract(undefined);
      setBridgeContractStatus(BridgeContractStatus.NOT_AVAILABLE);
      return;
    }

    getContract(aeSdk, contractAddress, Bridge_aci).then((contract) => {
      setBridgeContract(contract);
      setBridgeContractStatus(BridgeContractStatus.READY);
    });
  }, [networkId]);

  useEffect(() => {
    if (!bridgeContract) {
      setRegisteredNetworks([]);
      setRegisteredTokens([]);
      return;
    }

    setIsLoadingInitialBridgeConfig(true);
    getRegisteredNetworksAndTokens(bridgeContract).then(
      ({ registeredNetworks, registeredTokens }) => {
        setRegisteredNetworks(registeredNetworks);
        setRegisteredTokens(registeredTokens);
        setIsLoadingInitialBridgeConfig(false);
      },
    );
  }, [bridgeContract]);

  useEffect(() => {
    if (!address || !registeredTokens.length) return;

    getTokenBalances(registeredTokens, address).then(setTokenBalances);
  }, [address, registeredTokens]);

  return (
    <BridgeContext.Provider
      value={{
        bridgeContract,
        registeredTokens,
        registeredNetworks,
        isLoadingInitialBridgeConfig,
        bridgeContractStatus,
        tokenBalances,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
}
