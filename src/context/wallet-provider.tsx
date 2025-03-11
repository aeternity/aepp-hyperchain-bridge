"use client";

import { createContext, useEffect, useRef, useState } from "react";
import {
  AccountBase,
  BrowserWindowMessageConnection,
  SUBSCRIPTION_TYPES,
  WalletConnectorFrame,
  walletDetector,
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
  address: "",
  networkId: "",
  detectionStatus: WalletDetectionStatus.IDLE,
  connectionStatus: WalletConnectionStatus.IDLE,
  // isConnected: false,
  // isConnecting: false,
  connect: () => {},
  disconnect: () => {},
});

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [detectionStatus, setDetectionStatus] = useState(WalletDetectionStatus.IDLE);
  const [connectionStatus, setConnectionStatus] = useState(WalletConnectionStatus.IDLE);

  const wallet = useRef<Wallet | null>(null);
  const connector = useRef<WalletConnectorFrame | null>(null);

  useEffect(() => {
    (async function () {
      wallet.current = await getWallet();

      if (wallet.current !== null) {
        setConnectionStatus(WalletConnectionStatus.CONNECTING);
        connector.current = await getConnector(wallet.current);

        connector.current.addListener("accountsChange", async (accounts: AccountBase[]) => {
          aeSdk.addAccount(accounts[0], { select: true });
          setAddress(aeSdk.address);
        });

        connector.current.addListener("networkIdChange", async (networkId: string) => {
          aeSdk.selectNode(networkId);
          setNetworkId(networkId);
        });

        connector.current.addListener("disconnect", () => {
          setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
          setNetworkId("");
          setAddress("");
        });

        await tryConnect();
      } else {
        setDetectionStatus(WalletDetectionStatus.FAILURE);
      }
    })();
  }, []);

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

  const getConnector = (wallet: Wallet) =>
    WalletConnectorFrame.connect("Hyperchain Bridge Aepp", wallet.getConnection());

  const tryConnect = async () => {
    try {
      await connector.current?.subscribeAccounts("subscribe" as SUBSCRIPTION_TYPES, "current");
      setConnectionStatus(WalletConnectionStatus.CONNECTED);
    } catch (error) {
      setConnectionStatus(WalletConnectionStatus.FAILED);
    }
  };

  const connect = async () => {
    tryConnect();
  };

  const disconnect = async () => {
    // disconnect is not working properly
    // connector.current?.disconnect();

    setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
    setNetworkId("");
    setAddress("");
  };

  return (
    <WalletContext.Provider
      value={{ address, networkId, detectionStatus, connectionStatus, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}
