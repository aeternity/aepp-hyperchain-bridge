import { DEFAULT_NETWORKS } from "@/constants/networks";
import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";
import { useQuery } from "@tanstack/react-query";
import { Network } from "@/types/network";

const useNetworks = () => {
  const { networkId } = useContext(WalletContext);

  const { data: remoteNetworks } = useQuery({
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

  const otherNetworks = allNetworks.filter(
    (network) => network.id !== networkId
  );
  const currentNetwork = allNetworks.find(
    (network) => network.id === networkId
  );
  const getNetworkById = (id: string) =>
    DEFAULT_NETWORKS.find((network) => network.id === id);

  return {
    allNetworks,
    currentNetwork,
    otherNetworks,
    getNetworkById,
  };
};

export default useNetworks;
