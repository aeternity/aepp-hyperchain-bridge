import { useContext } from "react";

import Button from "@/components/base/button";
import { WalletContext } from "@/context/wallet-provider";
import { ConnectionStatus } from "@/types/wallet";

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
