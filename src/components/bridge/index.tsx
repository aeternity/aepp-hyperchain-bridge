import { useContext } from "react";

import BridgeForm from "./form";
import FormTitle from "./form/title";
import { BridgeContext } from "@/context/bridge-provider";
import { BridgeContractStatus } from "@/types/contract";
import { WalletContext } from "@/context/wallet-provider";
import { ConnectionStatus, DetectionStatus } from "@/types/wallet";

export default function Bridge() {
  const { bridgeContractStatus } = useContext(BridgeContext);
  const { connectionStatus, detectionStatus } = useContext(WalletContext);

  const shouldShowWalletConnectMessage =
    connectionStatus === ConnectionStatus.CONNECTING ||
    connectionStatus === ConnectionStatus.DISCONNECTED ||
    connectionStatus === ConnectionStatus.FAILED;

  const displayMessage = (message: string) => (
    <div className="text-aepink mt-15 text-center text-2xl font-medium">{message}</div>
  );

  return (
    <div className="mt-12 mb-9 flex flex-1 flex-col md:my-20 md:w-[600px]">
      <FormTitle />
      {detectionStatus === DetectionStatus.FAILED &&
        displayMessage("Failed to detect wallet. Please install and connect Superhero wallet")}

      {shouldShowWalletConnectMessage
        ? displayMessage("Please connect your wallet to use the bridge")
        : bridgeContractStatus === BridgeContractStatus.READY && <BridgeForm />}

      {bridgeContractStatus === BridgeContractStatus.NOT_AVAILABLE &&
        displayMessage("Bridge contract is not available for this network :(")}
    </div>
  );
}
