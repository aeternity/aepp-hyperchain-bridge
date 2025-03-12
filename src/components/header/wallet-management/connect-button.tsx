import { useContext } from "react";

import Button from "@/components/base/button";
import { ConnectionStatus, WalletContext } from "@/context/wallet-provider";

export default function ConnectButton() {
  const { connect, connectionStatus } = useContext(WalletContext);
  const isConnecting = connectionStatus === ConnectionStatus.CONNECTING;
  const connectingClass = isConnecting ? "animate-pulse" : "";

  return (
    <Button onClick={connect} className={connectingClass}>
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
