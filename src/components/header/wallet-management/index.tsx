"use client";

import { useContext } from "react";
import { WalletConnectionStatus, WalletContext } from "@/context/wallet-provider";

import ConnectButton from "./connect-button";
import ConnectedView from "./connected-view";

export default function WalletManagement() {
  const { connectionStatus } = useContext(WalletContext);

  if (connectionStatus === WalletConnectionStatus.CONNECTED) {
    return <ConnectedView />;
  }

  return <ConnectButton />;
}
