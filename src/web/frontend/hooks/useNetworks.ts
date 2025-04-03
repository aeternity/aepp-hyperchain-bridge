import { ALL_NETWORKS } from "@/constants/networks";
import { useContext } from "react";
import { WalletContext } from "../context/wallet-provider";

const useNetworks = () => {
  const { networkId } = useContext(WalletContext);

  return ALL_NETWORKS.filter((network) => network.id !== networkId);
};

export default useNetworks;
