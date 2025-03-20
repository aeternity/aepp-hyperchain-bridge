import { Network } from "@aepp-hyperchain-bridge/shared";
import { useState, useEffect } from "react";
import useBridgeContract from "./useBridgeContract";
import { getNetworkById } from "@aepp-hyperchain-bridge/shared";

const useRegisteredNetworks = () => {
  const { bridgeContract } = useBridgeContract();
  const [networks, setNetworks] = useState<Network[]>([]);

  useEffect(() => {
    if (bridgeContract) {
      bridgeContract
        .registered_networks()
        .then((result) => result.decodedResult)
        .then((networkIds) => networkIds.map(getNetworkById).filter(Boolean))
        .then(setNetworks);
    } else {
      setNetworks([]);
    }
  }, [bridgeContract]);

  return networks;
};

export default useRegisteredNetworks;
