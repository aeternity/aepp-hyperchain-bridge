import { useContext } from "react";

import BridgeForm from "@/frontend/components/bridge-form";
import { ConnectionStatus, DetectionStatus } from "@/types/wallet";
import { WalletContext } from "@/frontend/context/wallet-provider";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import NetworkForm from "../components/network-form";

export default function Bridge() {
  const { connectionStatus, detectionStatus, isUnsupportedNetwork } =
    useContext(WalletContext);

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

    if (connectionStatus === ConnectionStatus.CONNECTED) {
      if (!isUnsupportedNetwork) {
        return <BridgeForm />;
      } else {
        return <NetworkForm />;
      }
    }
  };

  return (
    <main className="flex flex-1 flex-row overflow-hidden">
      <div className=" mt-12 mb-9 flex-col max-sm:my-5 md:my-20 md:w-[600px] max-w-screen-2xl xl:px-0 px-4 m-auto z-10">
        {content()}
      </div>
    </main>
  );
}
