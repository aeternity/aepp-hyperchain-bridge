import { useState, useEffect, useContext } from "react";
import {
  BridgeContract,
  getBridgeContractAddress,
  getContract,
} from "@aepp-hyperchain-bridge/shared";

import { walletSdk } from "../utils/wallet-sdk";
import { WalletContext } from "../context/wallet-provider";
import { HyperchainBridge_aci } from "@aepp-hyperchain-bridge/contracts";
import { BridgeContractStatus } from "../types";

const useBridgeContract = () => {
  const { address, networkId } = useContext(WalletContext);
  const [bridgeContract, setBridgeContract] = useState<BridgeContract>();
  const [status, setStatus] = useState(BridgeContractStatus.LOADING);

  useEffect(() => {
    if (!networkId) return;

    const contractAddress = getBridgeContractAddress(networkId);
    if (!contractAddress) {
      setBridgeContract(null);
      setStatus(BridgeContractStatus.NOT_AVAILABLE);
      return;
    }

    getContract(walletSdk, contractAddress, HyperchainBridge_aci).then(
      (contract) => {
        setBridgeContract(contract);
        setStatus(BridgeContractStatus.AVAILABLE);
      }
    );
  }, [address, networkId]);

  return { bridgeContract, status };
};

export default useBridgeContract;
