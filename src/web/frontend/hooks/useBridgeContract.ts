import { useState, useEffect, useContext, useCallback } from "react";

import { walletSdk } from "../utils/wallet-sdk";
import { WalletContext } from "../context/wallet-provider";
import HyperchainBridge_aci from "@/aci/HyperchainBridge.json";
import { BridgeContractStatus } from "@/types/wallet";
import {
  BridgeEntryTx,
  HyperchainBridge,
  HyperchainBridgeContract,
} from "@/types/bridge";
import { getNetworkBaseById, getNetworkById } from "@/utils/data/filters";
import { getContract } from "@/utils/contract/helper";
import { AppContext } from "../context/app-provider";
import { Token } from "@/types/token";
import { setTokenAllowance } from "../utils/token-helper";
import useNetworks from "./useNetworks";

const useBridgeContract = () => {
  const { address } = useContext(WalletContext);
  const { getNetworkById, currentNetwork } = useNetworks();
  const { showError, showInfo, showSuccess } = useContext(AppContext);
  const [bridgeContract, setBridgeContract] =
    useState<HyperchainBridgeContract | null>(null);
  const [contractState, setContractState] = useState(
    BridgeContractStatus.LOADING
  );
  const [isBusy, setBusy] = useState(false);

  useEffect(() => {
    if (!currentNetwork?.id) return;

    const contractAddress =
      currentNetwork?.bridgeContractAddress as `ct_${string}`;
    if (!contractAddress) {
      setBridgeContract(null);
      setContractState(BridgeContractStatus.NOT_AVAILABLE);
      return;
    }

    getContract<HyperchainBridge>(
      walletSdk,
      contractAddress,
      HyperchainBridge_aci
    ).then((contract) => {
      setBridgeContract(contract);
      setContractState(BridgeContractStatus.AVAILABLE);
    });
  }, [address, currentNetwork?.id]);

  const enterBridge = useCallback(
    async (destinationNetworkId: string, token: Token, amount: string) => {
      setBusy(true);
      try {
        const isNative = token.address === "native";

        if (!isNative) {
          const alreadySet = await setTokenAllowance(
            amount,
            token.address,
            walletSdk.address,
            bridgeContract?.$options.address!
          );
          if (!alreadySet) showInfo("Allowance is set successfully");
        }
        const network = getNetworkBaseById(destinationNetworkId);

        const result = await bridgeContract?.enter_bridge(
          BigInt(amount),
          network,
          isNative ? undefined : token.address,
          {
            ttl: 30,
            amount: isNative ? BigInt(amount) : undefined,
          }
        );

        showSuccess(`Bridge entry is successful with tx hash: ${result?.hash}`);
        setBusy(false);
        return [true, result];
      } catch (error: any) {
        setBusy(false);
        showError(error.message);
        return [false, error];
      }
    },
    [bridgeContract, showError, showInfo, showSuccess]
  );

  const exitBridge = useCallback(
    async (entryTx: BridgeEntryTx) => {
      setBusy(true);
      try {
        const sourceNetwork = getNetworkById(entryTx.source_network_id)!;
        const _resp = await fetch(
          `/api/exit-params/${encodeURIComponent(sourceNetwork.url)}/${
            sourceNetwork.bridgeContractAddress
          }/${entryTx.idx}/${entryTx.hash}`
        );
        const { ok, error, signature, exitRequest, timestamp } =
          await _resp.json();

        if (!ok) throw new Error(error);

        const exitTx = await bridgeContract?.exit_bridge(
          exitRequest,
          timestamp,
          signature,
          {
            ttl: 30,
          }
        );

        showSuccess(
          `Exit bridge transaction is successful with tx hash: ${exitTx?.hash}`
        );
      } catch (error: any) {
        setBusy(false);
        showError(error.message);
      }

      setBusy(false);
    },
    [bridgeContract]
  );

  return { isBusy, bridgeContract, contractState, enterBridge, exitBridge };
};

export default useBridgeContract;
