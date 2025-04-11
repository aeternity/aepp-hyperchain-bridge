import { useState, useContext, useCallback } from "react";

import { walletSdk } from "../utils/wallet-sdk";
import { BridgeEntryTx } from "@/types/bridge";
import { getNetworkBaseById } from "@/utils/data/filters";
import { getBridgeContract } from "@/utils/contract/helper";
import { AppContext } from "../context/app-provider";
import { Token } from "@/types/token";
import { setTokenAllowance } from "../utils/token-helper";
import useNetworks from "./useNetworks";

const useBridgeContract = () => {
  const { getNetworkById, currentNetwork } = useNetworks();
  const { showError, showInfo, showSuccess } = useContext(AppContext);
  const [isBusy, setBusy] = useState(false);

  const enterBridge = useCallback(
    async (destinationNetworkId: string, token: Token, amount: string) => {
      setBusy(true);
      try {
        if (!currentNetwork) throw new Error("Network not found");

        const bridgeContract = await getBridgeContract(
          walletSdk,
          currentNetwork.bridgeContractAddress as `ct_${string}`
        );
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
    [currentNetwork?.id, showError, showInfo, showSuccess]
  );

  const exitBridge = useCallback(
    async (entryTx: BridgeEntryTx) => {
      setBusy(true);
      try {
        if (!currentNetwork) throw new Error("Network not found");

        const bridgeContract = await getBridgeContract(
          walletSdk,
          currentNetwork.bridgeContractAddress as `ct_${string}`
        );
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
        setBusy(false);
      } catch (error: any) {
        setBusy(false);
        showError(error.message);
      }
    },
    [currentNetwork?.id]
  );

  return { isBusy, enterBridge, exitBridge };
};

export default useBridgeContract;
