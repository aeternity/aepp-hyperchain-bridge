import { useState, useEffect, useContext } from "react";
import {
  BridgeContract,
  getBridgeContractAddress,
  getContract,
} from "@aepp-hyperchain-bridge/shared";

import { walletSdk } from "../utils/wallet-sdk";
import { WalletContext } from "../context/wallet-provider";
import { HyperchainBridge_aci } from "@aepp-hyperchain-bridge/contracts";

// This hook is used to get the bridge contract instance
// based on the current network and user address
// Returns the bridge contract instance or null if the contract is not deployed
// or undefined if the contract is being loaded
const useBridgeContract = (): BridgeContract | null | undefined => {
  const { address: userAddress, networkId } = useContext(WalletContext);
  const [bridgeContract, setBridgeContract] = useState<BridgeContract>();

  useEffect(() => {
    const contractAddress = getBridgeContractAddress(networkId);
    if (!contractAddress) {
      setBridgeContract(null);
      return;
    }

    getContract(walletSdk, contractAddress, HyperchainBridge_aci).then(
      (contract) => {
        setBridgeContract(contract);
      }
    );
  }, [userAddress, networkId]);

  return bridgeContract;
};

export default useBridgeContract;
