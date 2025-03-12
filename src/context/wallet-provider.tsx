"use client";

import { createContext, useEffect, useState } from "react";
import { AccountBase, SUBSCRIPTION_TYPES, WalletConnectorFrame } from "@aeternity/aepp-sdk";

import { aeSdk, getConnector, getWallet } from "@/lib/aeternity";

export enum DetectionStatus {
  IDLE,
  DETECTING,
  DETECTED,
  FAILED,
}

export enum ConnectionStatus {
  IDLE,
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
  FAILED,
}

export const WalletContext = createContext({
  balance: "",
  address: "",
  networkId: "",
  detectionStatus: DetectionStatus.IDLE,
  connectionStatus: ConnectionStatus.IDLE,
  currency: { symbol: "", decimals: 0 },
  connect: () => {},
  disconnect: () => {},
  requestNetworkChange: (networkId: string) => {},
});

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState("");
  const [networkId, setNetworkId] = useState("");
  const [address, setAddress] = useState<`ak_${string}` | "">("");
  const [currency, setCurrency] = useState({ symbol: "", decimals: 0 });
  const [detectionStatus, setDetectionStatus] = useState(DetectionStatus.IDLE);
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.IDLE);

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connector, setConnector] = useState<WalletConnectorFrame | null>(null);

  useEffect(() => {
    setDetectionStatus(DetectionStatus.DETECTING);

    getWallet().then((wallet: Wallet) => {
      setWallet(wallet);
      setDetectionStatus(wallet ? DetectionStatus.DETECTED : DetectionStatus.FAILED);
    });
  }, []);

  useEffect(() => {
    if (!wallet) return;

    getConnector(wallet).then((connector: WalletConnectorFrame | null) => {
      setConnector(connector);
    });
  }, [wallet]);

  useEffect(() => {
    aeSdk.getNodeInfo().then((info) => {
      fetch(`${info.url}v3/currency`)
        .then((res) => res.json())
        .then((data) =>
          setCurrency({ symbol: data.symbol, decimals: Math.log10(data.subunits_per_unit) }),
        );
    });
  }, [networkId]);

  useEffect(() => {
    address && aeSdk.getBalance(address).then(setBalance);
  }, [networkId, address]);

  useEffect(() => {
    if (!connector) return;

    connector.addListener("accountsChange", async (accounts: AccountBase[]) => {
      aeSdk.addAccount(accounts[0], { select: true });
      aeSdk.selectNode(connector.networkId);
      setAddress(aeSdk.address);
      setNetworkId(connector.networkId);
    });

    connector.addListener("networkIdChange", async (networkId: string) => {
      aeSdk.selectNode(networkId);
      setNetworkId(networkId);
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
  }, [connector]);

  const tryConnect = async () => {
    try {
      setConnectionStatus(ConnectionStatus.CONNECTING);

      if (connector && connector.isConnected) {
        await connector.subscribeAccounts("subscribe" as SUBSCRIPTION_TYPES, "current");
        setConnectionStatus(ConnectionStatus.CONNECTED);
      }
    } catch (error) {
      setConnectionStatus(ConnectionStatus.FAILED);
    }
  };

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
        balance,
        address,
        currency,
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
