import { useState, useEffect, useContext } from "react";
import {
  BridgeContract,
  getBridgeContractAddress,
  getContract,
} from "@aepp-hyperchain-bridge/shared";

import { walletSdk } from "../utils/wallet-sdk";
import { WalletContext } from "../context/wallet-provider";
import { HyperchainBridge_aci } from "@aepp-hyperchain-bridge/contracts";

const useBridgeContract = () => {
  const { address, networkId } = useContext(WalletContext);
  const [bridgeContract, setBridgeContract] = useState<BridgeContract>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const contractAddress = getBridgeContractAddress(networkId);
    if (!contractAddress) {
      setLoading(false);
      setBridgeContract(null);
      return;
    }

    getContract(walletSdk, contractAddress, HyperchainBridge_aci).then(
      (contract) => {
        setBridgeContract(contract);
        setLoading(false);
      }
    );
  }, [address, networkId]);

  return { bridgeContract, loading };
};

export default useBridgeContract;
