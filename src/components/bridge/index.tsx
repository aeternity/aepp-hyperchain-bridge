import { useContext } from "react";

import BridgeForm from "./form";
import FormTitle from "./form/title";
import { BridgeContext } from "@/context/bridge-provider";
import { BridgeContractStatus } from "@/types/contract";
import { WalletContext } from "@/context/wallet-provider";
import { ConnectionStatus, DetectionStatus } from "@/types/wallet";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function Bridge() {
  const { bridgeContractStatus } = useContext(BridgeContext);
  const { connectionStatus, detectionStatus } = useContext(WalletContext);

  const shouldShowWalletConnectMessage =
    connectionStatus === ConnectionStatus.CONNECTING ||
    connectionStatus === ConnectionStatus.DISCONNECTED ||
    connectionStatus === ConnectionStatus.FAILED;

  const displayMessage = (message: string) => (
    <div className="mt-15 flex w-full flex-wrap items-center justify-center gap-2 border-t border-b p-4 text-center text-2xl font-medium text-black max-sm:flex-row">
      <ExclamationTriangleIcon stroke="black" width={30} height={30} />
      <span>{message}</span>
    </div>
  );

  return (
    <div className="mt-12 mb-9 flex flex-1 flex-col max-sm:my-5 md:my-20 md:w-[600px]">
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
