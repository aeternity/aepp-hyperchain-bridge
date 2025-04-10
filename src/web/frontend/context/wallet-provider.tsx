import { createContext, useCallback, useEffect, useState } from "react";
import {
  AccountBase,
  SUBSCRIPTION_TYPES,
  WalletConnectorFrame,
} from "@aeternity/aepp-sdk";

import { ConnectionStatus, DetectionStatus, Wallet } from "@/types/wallet";
import { getConnector, getWallet, walletSdk } from "../utils/wallet-sdk";
import { getNetworkById } from "@/utils/data/filters";

export const WalletContext = createContext({
  address: "",
  networkId: "",
  detectionStatus: DetectionStatus.IDLE,
  connectionStatus: ConnectionStatus.IDLE,
  connect: () => {},
  disconnect: () => {},
  requestNetworkChange: (networkId: string) => {},
});

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [networkId, setNetworkId] = useState("");
  const [address, setAddress] = useState<`ak_${string}` | "">("");

  const [detectionStatus, setDetectionStatus] = useState(DetectionStatus.IDLE);
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.IDLE
  );

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connector, setConnector] = useState<WalletConnectorFrame | null>(null);

  useEffect(() => {
    setDetectionStatus(DetectionStatus.DETECTING);

    getWallet().then((wallet: Wallet | null) => {
      setWallet(wallet);
      setDetectionStatus(
        wallet ? DetectionStatus.DETECTED : DetectionStatus.FAILED
      );
    });
  }, []);

  useEffect(() => {
    if (!wallet) return;

    getConnector(wallet).then((connector: WalletConnectorFrame | null) => {
      setConnector(connector);
    });
  }, [wallet]);

  const tryConnect = useCallback(async () => {
    try {
      setConnectionStatus(ConnectionStatus.CONNECTING);

      if (connector && connector.isConnected) {
        await connector.subscribeAccounts(
          "subscribe" as SUBSCRIPTION_TYPES,
          "current"
        );
        setConnectionStatus(ConnectionStatus.CONNECTED);
      }
    } catch (error) {
      setConnectionStatus(ConnectionStatus.FAILED);
      console.error(error);
    }
  }, [connector, setConnectionStatus]);

  useEffect(() => {
    if (!connector) return;

    connector.addListener("accountsChange", async (accounts: AccountBase[]) => {
      walletSdk.addAccount(accounts[0], { select: true });
      walletSdk.selectNode(connector.networkId);
      setAddress(walletSdk.address);
      setNetworkId(connector.networkId);
    });

    connector.addListener("networkIdChange", async (_networkId: string) => {
      const network = getNetworkById(_networkId);
      if (!network) {
        alert("Network not found");
        return;
      }
      walletSdk.selectNode(_networkId);
      setNetworkId(_networkId);
    });

    connector.addListener("disconnect", () => {
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      setNetworkId("");
      setAddress("");
    });

    tryConnect();

    return () => {
      connector.removeAllListeners();
    };
  }, [connector, tryConnect]);

  const connect = async () => {
    tryConnect();
  };

  const disconnect = async () => {
    // couldn't make disconnect & reconnect work
    // so for now, just set the connection status to disconnected

    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setNetworkId("");
    setAddress("");
  };

  const requestNetworkChange = async (networkId: string) => {
    // couldn't make network change work

    connector?.askToSelectNetwork({ networkId });
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        networkId,
        detectionStatus,
        connectionStatus,
        connect,
        disconnect,
        requestNetworkChange,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
