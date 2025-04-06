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

const useBridgeContract = () => {
  const { address, networkId } = useContext(WalletContext);
  const { showError, showInfo, showSuccess } = useContext(AppContext);
  const [bridgeContract, setBridgeContract] =
    useState<HyperchainBridgeContract | null>(null);
  const [contractState, setContractState] = useState(
    BridgeContractStatus.LOADING
  );
  const [isBusy, setBusy] = useState(false);

  useEffect(() => {
    if (!networkId) return;

    const network = getNetworkById(networkId);
    const contractAddress = network?.bridgeContractAddress as `ct_${string}`;
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
  }, [address, networkId]);

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

        showSuccess(
          `Deposit ID:${result?.decodedResult} is successful with tx hash: ${result?.hash}`
        );
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

  return { bridgeContract, contractState, enterBridge, isBusy };
};

export default useBridgeContract;
