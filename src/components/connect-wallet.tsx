"use client";

import { useContext, useState } from "react";
import { WalletConnectionStatus, WalletContext } from "@/context/wallet-provider";

export default function ConnectWallet() {
  const { address, connect, connectionStatus, disconnect } = useContext(WalletContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectingClass = isConnecting ? "animate-pulse" : "";

  const handleConnectWalletClick = async () => {
    if (connectionStatus === WalletConnectionStatus.CONNECTED) {
      disconnect();
    } else {
      connect();
    }
  };
  return (
    <div
      onClick={handleConnectWalletClick}
      className={`text-aepink-100 hover:bg-aepink-100 cursor-pointer rounded-xl border px-2.5 py-1 text-sm hover:text-white ${connectingClass}`}
    >
      Connect Wallet {address}
    </div>
  );
}
