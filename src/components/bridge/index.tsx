import { useContext } from "react";

import BridgeForm from "./form";
import FormTitle from "./form/title";
import { BridgeContext } from "@/context/bridge-provider";
import { BridgeContractStatus } from "@/types/contract";

export default function Bridge() {
  const { bridgeContractStatus } = useContext(BridgeContext);

  return (
    <div>
      <FormTitle />
      {bridgeContractStatus === BridgeContractStatus.READY && <BridgeForm />}
      {bridgeContractStatus === BridgeContractStatus.NOT_AVAILABLE && (
        <div className="mt-15 text-center text-2xl font-medium">
          Bridge contract is not available for this network :(
        </div>
      )}
    </div>
  );
}
