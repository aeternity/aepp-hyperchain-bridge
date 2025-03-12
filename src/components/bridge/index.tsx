import { useContext } from "react";

import { BridgeContext } from "@/context/bridge-provider";

export default function Bridge() {
  const { contractDeployment } = useContext(BridgeContext);
  return (
    <div className="">
      <p>contractDeployment: {contractDeployment?.address}</p>
    </div>
  );
}
