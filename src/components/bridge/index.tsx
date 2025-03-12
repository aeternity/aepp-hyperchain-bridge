import { useContext } from "react";

import { BridgeContext } from "@/context/bridge-provider";

export default function Bridge() {
  const { contractDeployment } = useContext(BridgeContext);
  return <div>{contractDeployment?.address}</div>;
}
