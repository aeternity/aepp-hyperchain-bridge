import { DEFAULT_NETWORKS } from "@/constants/networks";
import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { Network } from "@/types/network";
import { ConnectionStatus } from "@/types/wallet";
import { byId, notById } from "@/utils/data/filters";

const useNetworks = () => {
  const { networkId, connectionStatus } = useContext(WalletContext);

  const { data: remoteNetworks, refetch: refetchNetworks } = useQuery({
    queryKey: ["networks"],
    queryFn: async () => {
      try {
        const resp = await fetch(`/api/networks`);
        return await resp.json();
      } catch (e) {
        console.error("Error fetching networks", e);
        return [];
      }
    },
    initialData: [],
  });

  const allNetworks = [...DEFAULT_NETWORKS, ...remoteNetworks] as Network[];
  const otherNetworks = allNetworks.filter(notById(networkId));
  const currentNetwork = allNetworks.find(byId(networkId));

  const getNetworkById = (id: string) => allNetworks.find(byId(id));

  const isUnsupportedNetwork =
    !currentNetwork && connectionStatus === ConnectionStatus.CONNECTED;

  return {
    allNetworks,
    currentNetwork,
    otherNetworks,
    isUnsupportedNetwork,
    getNetworkById,
    refetchNetworks,
  };
};

export default useNetworks;
