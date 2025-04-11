import { useContext } from "react";

import BridgeForm from "@/frontend/components/bridge-form";
import { ConnectionStatus, DetectionStatus } from "@/types/wallet";
import { WalletContext } from "@/frontend/context/wallet-provider";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import useNetworks from "../hooks/useNetworks";

export default function Bridge() {
  const { currentNetwork } = useNetworks();
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

    if (connectionStatus === ConnectionStatus.CONNECTED) {
      if (currentNetwork) {
        return <BridgeForm />;
      } else {
        return displayMessage(
          "Unsupported network. Please switch to Aeternity mainnet or Hyperchain",
          false
        );
      }
    }
  };

  return (
    <main className="relative flex flex-1 flex-row overflow-hidden">
      <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[url(../assets/hc-logo.svg)] bg-[auto_50px] z-[0] opacity-5 rotate-[30deg] bg-repeat-space"></div>
      <div className=" mt-12 mb-9 flex-col max-sm:my-5 md:my-20 md:w-[600px] max-w-screen-2xl xl:px-0 px-4 m-auto z-10">
        {content()}
      </div>
    </main>
  );
}
