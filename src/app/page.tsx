"use client";

import Bridge from "@/components/bridge";
import BridgeProvider from "@/context/bridge-provider";

export default function Page() {
  return (
    <div className="mt-12 mb-9 flex flex-col md:my-20 md:w-[810px]">
      <BridgeProvider>
        <Bridge />
      </BridgeProvider>
    </div>
  );
}
