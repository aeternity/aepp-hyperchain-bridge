import { useContext } from "react";

import { WalletConnectionStatus, WalletContext } from "@/context/wallet-provider";

export default function ConnectButton() {
  const { connect, connectionStatus } = useContext(WalletContext);
  const isConnecting = connectionStatus === WalletConnectionStatus.CONNECTING;
  const connectingClass = isConnecting ? "animate-pulse" : "";

  return (
    <div
      onClick={connect}
      className={`text-aepink-100 hover:bg-aepink-100 text-md cursor-pointer rounded-xl border px-2.5 py-1 font-medium hover:text-white ${connectingClass}`}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </div>
  );
}
