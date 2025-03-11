"use client";

import { createContext, useEffect, useState } from "react";
import {
  AccountBase,
  walletDetector,
  SUBSCRIPTION_TYPES,
  WalletConnectorFrame,
  BrowserWindowMessageConnection,
} from "@aeternity/aepp-sdk";
import { aeSdk } from "@/lib/aeternity";

type Wallet = Parameters<Parameters<typeof walletDetector>[1]>[0]["newWallet"];

export enum WalletDetectionStatus {
  IN_PROGRESS,
  SUCCESS,
  FAILURE,
  IDLE,
}
export enum WalletConnectionStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
  FAILED,
  IDLE,
}

export const WalletContext = createContext({
  balance: "",
  address: "",
  networkId: "",
  detectionStatus: WalletDetectionStatus.IDLE,
  connectionStatus: WalletConnectionStatus.IDLE,
  connect: () => {},
  disconnect: () => {},
  requestNetworkChange: (networkId: string) => {},
});

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [address, setAddress] = useState<`ak_${string}` | "">("");
  const [detectionStatus, setDetectionStatus] = useState(WalletDetectionStatus.IDLE);
  const [connectionStatus, setConnectionStatus] = useState(WalletConnectionStatus.IDLE);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connector, setConnector] = useState<WalletConnectorFrame | null>(null);

  useEffect(() => {
    getWallet().then(setWallet);
  }, []);

  useEffect(() => {
    getConnector(wallet)?.then(setConnector);
  }, [wallet]);

  useEffect(() => {
    address && aeSdk.getBalance(address).then(setBalance);
  }, [networkId, address]);

  useEffect(() => {
    if (connector === null) return;

    setConnectionStatus(WalletConnectionStatus.CONNECTING);

    connector.addListener("accountsChange", async (accounts: AccountBase[]) => {
      aeSdk.addAccount(accounts[0], { select: true });
      setAddress(aeSdk.address);
      setNetworkId(connector.networkId);

      // because not correct node is selected in the beginning
      aeSdk.selectNode(connector.networkId);
    });

    connector.addListener("networkIdChange", async (networkId: string) => {
      aeSdk.selectNode(networkId);
      setNetworkId(networkId);
    });

    connector.addListener("disconnect", () => {
      setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
      setNetworkId("");
      setAddress("");
    });

    tryConnect();

    return () => {
      connector.removeAllListeners();
    };
  }, [connector]);

  const getWallet = () =>
    new Promise<Wallet | null>((resolveWallet) => {
      setDetectionStatus(WalletDetectionStatus.IN_PROGRESS);
      const scannerConnection = new BrowserWindowMessageConnection();
      const stopScan = walletDetector(scannerConnection, ({ newWallet }) => {
        setDetectionStatus(WalletDetectionStatus.SUCCESS);
        clearTimeout(walletDetectionTimeout);
        resolveWallet(newWallet);
        stopScan();
      });

      const walletDetectionTimeout = setTimeout(() => resolveWallet(null), 2000);
    });

  const getConnector = (wallet: Wallet | null) => {
    if (!wallet) return null;
    return WalletConnectorFrame.connect("Hyperchain Bridge Aepp", wallet.getConnection());
  };

  const tryConnect = async () => {
    try {
      await connector?.subscribeAccounts("subscribe" as SUBSCRIPTION_TYPES, "current");
      setConnectionStatus(WalletConnectionStatus.CONNECTED);
    } catch (error) {
      setConnectionStatus(WalletConnectionStatus.FAILED);
    }
  };

  const connect = async () => {
    tryConnect();
  };

  const disconnect = async () => {
    // couldn't make disconnect & reconnect work
    // so for now, just set the connection status to disconnected

    setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
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
        balance,
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
