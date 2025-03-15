"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { WalletContext } from "./wallet-provider";
import { BridgeContractStatus, GenericContract } from "@/types/contract";
import { aeSdk, getContract } from "@/utils/ae-sdk";
import { getBridgeContractAddress } from "@/utils/filters";
import {
  getRegisteredNetworksAndTokens,
  getTokenBalances,
  setTokenAllowance,
} from "@/utils/contract-state";
import { AppContext } from "./app-provider";
import { mapTokensWithBalances } from "@/utils/mappers";

import Bridge_aci from "../../contracts/aci/HyperchainBridge.json";

export const BridgeContext = createContext({
  isActionInProgress: false,
  registeredTokens: [] as Token[],
  tokensWithBalances: [] as Token[],
  isLoadingInitialBridgeConfig: true,
  registeredNetworks: [] as Network[],
  tokenBalances: [] as TokenBalance[],
  bridgeContractStatus: BridgeContractStatus.IDLE,
  bridgeDeposit: async (
    /* eslint-disable @typescript-eslint/no-unused-vars */
    networkId: string,
    tokenAddress: string,
    amount: string,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  ): Promise<boolean | undefined> => {
    return;
  },
});

export default function BridgeProvider({ children }: { children: React.ReactNode }) {
  const { networkId, address } = useContext(WalletContext);
  const { showError, showSuccess, showInfo } = useContext(AppContext);

  const [registeredTokens, setRegisteredTokens] = useState<Token[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [bridgeContract, setBridgeContract] = useState<GenericContract>();
  const [registeredNetworks, setRegisteredNetworks] = useState<Network[]>([]);
  const [isLoadingInitialBridgeConfig, setIsLoadingInitialBridgeConfig] = useState(true);
  const [bridgeContractStatus, setBridgeContractStatus] = useState(BridgeContractStatus.IDLE);
  const tokensWithBalances = mapTokensWithBalances(registeredTokens, tokenBalances);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

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

    if (!isActionInProgress) getTokenBalances(registeredTokens, address).then(setTokenBalances);
  }, [address, registeredTokens, isActionInProgress]);

  const bridgeDeposit = async (networkId: string, tokenAddress: string, amount: string) => {
    if (!bridgeContract) return;

    setIsActionInProgress(true);
    try {
      const alreadySet = await setTokenAllowance(
        amount,
        tokenAddress,
        aeSdk.address,
        bridgeContract.$options.address!,
      );
      if (!alreadySet) showInfo("Allowance is set successfully");
      const result = await bridgeContract.deposit(networkId, tokenAddress, amount);

      showSuccess(`Deposit ID:${result.decodedResult} is successful with tx hash: ${result.hash}`);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showError(error.message);
      return false;
    } finally {
      setIsActionInProgress(false);
    }
  };

  return (
    <BridgeContext.Provider
      value={{
        tokenBalances,
        registeredTokens,
        registeredNetworks,
        tokensWithBalances,
        bridgeContractStatus,
        isLoadingInitialBridgeConfig,
        isActionInProgress,
        bridgeDeposit,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
}
