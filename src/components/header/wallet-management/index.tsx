"use client";

import { useContext } from "react";

import ConnectButton from "./connect-button";
import ConnectedView from "./connected-view";
import InstallWalletButton from "./install-wallet-button";
import { WalletContext } from "@/context/wallet-provider";
import { ConnectionStatus, DetectionStatus } from "@/types/wallet";

export default function WalletManagement() {
  const { connectionStatus, detectionStatus } = useContext(WalletContext);

  switch (detectionStatus) {
    case DetectionStatus.IDLE:
    case DetectionStatus.DETECTING:
      return null;
    case DetectionStatus.FAILED:
      return <InstallWalletButton />;
    case DetectionStatus.DETECTED:
      switch (connectionStatus) {
        case ConnectionStatus.IDLE:
        case ConnectionStatus.DISCONNECTED:
        case ConnectionStatus.CONNECTING:
        case ConnectionStatus.FAILED:
          return <ConnectButton />;
        case ConnectionStatus.CONNECTED:
          return <ConnectedView />;
      }
  }
}
