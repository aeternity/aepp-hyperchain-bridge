import { useContext } from "react";

import BridgeForm from "@/frontend/components/bridge-form";
import FormTitle from "@/frontend/components/bridge-form/title";
import {
  BridgeContractStatus,
  ConnectionStatus,
  DetectionStatus,
} from "@/frontend/types";
import { WalletContext } from "@/frontend/context/wallet-provider";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import useBridgeContract from "../hooks/useBridgeContract";

export default function Bridge() {
  const { bridgeContract, status } = useBridgeContract();
  const { connectionStatus, detectionStatus } = useContext(WalletContext);

  const walletNotConnected =
    connectionStatus === ConnectionStatus.CONNECTING ||
    connectionStatus === ConnectionStatus.DISCONNECTED ||
    connectionStatus === ConnectionStatus.FAILED;

  const displayMessage = (message: string, showExclamation = true) => (
    <div className="border-aepink-100 mt-15 flex w-full flex-wrap items-center justify-center gap-2 border-t border-b p-4 text-center text-2xl font-medium text-black max-sm:flex-row">
      {showExclamation && (
        <ExclamationTriangleIcon stroke="black" width={30} height={30} />
      )}
      <span>{message}</span>
    </div>
  );

  const content = () => {
    if (detectionStatus === DetectionStatus.FAILED) {
      return displayMessage(
        "Failed to detect wallet. Please install and connect Superhero wallet"
      );
    }

    if (walletNotConnected) {
      return displayMessage("Please connect your wallet to use the bridge");
    }

    if (status === BridgeContractStatus.NOT_AVAILABLE) {
      return displayMessage(
        "Bridge contract is not available for this network :("
      );
    }

    if (status === BridgeContractStatus.AVAILABLE && bridgeContract) {
      return <BridgeForm />;
    }
  };

  return (
    <div className="mt-12 mb-9 flex flex-1 flex-col max-sm:my-5 md:my-20 md:w-[600px]">
      <FormTitle />
      {content()}
    </div>
  );
}
