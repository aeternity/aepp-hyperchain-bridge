"use client";

import Bridge from "@/components/bridge";
import BridgeProvider from "@/context/bridge-provider";

export default function Page() {
  return (
    <BridgeProvider>
      <Bridge />
    </BridgeProvider>
  );
}
