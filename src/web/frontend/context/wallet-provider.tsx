import { createContext, useCallback, useEffect, useState } from "react";
import {
  AccountBase,
  Node,
  SUBSCRIPTION_TYPES,
  WalletConnectorFrame,
} from "@aeternity/aepp-sdk";

import { ConnectionStatus, DetectionStatus, Wallet } from "@/types/wallet";
import { getConnector, getWallet, walletSdk } from "../utils/wallet-sdk";

import { Network, NetworkBase } from "@/types/network";
import { useQuery } from "@tanstack/react-query";
import { getNetworks } from "../utils/api";
import { DEFAULT_NETWORKS } from "@/constants/networks";
import { byId, notById } from "@/utils/data/filters";
import { mapNetworkToBase } from "@/utils/data/mappers";

export const WalletContext = createContext({
  address: "",
  networkId: "",
  detectionStatus: DetectionStatus.IDLE,
  connectionStatus: ConnectionStatus.IDLE,
  isUnsupportedNetwork: false,
  allNetworks: [] as Network[],
  otherNetworks: [] as Network[],
  currentNetwork: undefined as Network | undefined,
  connect: () => {},
  disconnect: () => {},
  addNewNode: (network: NetworkBase) => {},
  requestNetworkChange: (networkId: string) => {},
  refetchNetworks: () => {},
  getNetworkById: (id: string) => undefined as Network | undefined,
  getNetworkBaseById: (id: string) => ({} as NetworkBase),
});

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [networkId, setNetworkId] = useState("");
  const [address, setAddress] = useState<`ak_${string}` | "">("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [connector, setConnector] = useState<WalletConnectorFrame | null>(null);
  const [detectionStatus, setDetectionStatus] = useState(DetectionStatus.IDLE);
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.IDLE
  );

  const {
    data: remoteNetworks,
    refetch: refetchNetworks,
    isFetched: isFetchedNetworks,
  } = useQuery({
    queryKey: ["networks"],
    queryFn: getNetworks,
    initialData: [],
  });
  const allNetworks = [...DEFAULT_NETWORKS, ...remoteNetworks] as Network[];
  const otherNetworks = allNetworks.filter(notById(networkId));
  const currentNetwork = allNetworks.find(byId(networkId));
  const isUnsupportedNetwork = !currentNetwork;

  const getNetworkById = (id: string) => allNetworks.find(byId(id));
  const getNetworkBaseById = (id: string) =>
    mapNetworkToBase(getNetworkById(id)!);

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

  const handleNetworkChange = useCallback(
    async (_networkId: string) => {
      const network = getNetworkById(_networkId);
      if (network) {
        const nodesInPool = await walletSdk.getNodesInPool();
        if (nodesInPool.find((n) => n.nodeNetworkId === network.id)) {
          walletSdk.selectNode(_networkId);
          setNetworkId(_networkId);
        } else {
          addNewNode(network);
        }
      } else {
        setNetworkId("");
      }
    },
    [getNetworkById, setNetworkId]
  );

  const addNewNode = useCallback((network: NetworkBase) => {
    walletSdk.addNode(network.name, new Node(network.url), true);
    setNetworkId(network.id);
  }, []);

  useEffect(() => {
    if (!connector || !isFetchedNetworks) return;

    connector.addListener("accountsChange", async (accounts: AccountBase[]) => {
      walletSdk.addAccount(accounts[0], { select: true });
      setAddress(walletSdk.address);

      handleNetworkChange(connector.networkId);
    });

    connector.addListener("networkIdChange", async (_networkId: string) => {
      handleNetworkChange(_networkId);
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
  }, [connector, isFetchedNetworks, tryConnect]);

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
        allNetworks,
        otherNetworks,
        currentNetwork,
        isUnsupportedNetwork,
        connect,
        addNewNode,
        disconnect,
        getNetworkById,
        refetchNetworks,
        getNetworkBaseById,
        requestNetworkChange,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
