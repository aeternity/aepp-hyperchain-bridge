import { useContext } from "react";

import { BridgeContext } from "@/context/bridge-provider";
import BridgeForm from "./form";

export default function Bridge() {
  const { bridgeContract, registeredNetworks, registeredTokens } = useContext(BridgeContext);

  return (
    <>
      {registeredNetworks.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <BridgeForm registeredNetworks={registeredNetworks} registeredTokens={registeredTokens} />
      )}
      ;
    </>
  );
}
