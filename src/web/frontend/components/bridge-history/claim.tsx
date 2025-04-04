import { BridgeEntryTx } from "@/types/bridge";
import { verifyBridgeActionCompletion } from "@/utils/contract/bridge";
import { useEffect, useState } from "react";

interface ClaimProps {
  transaction: BridgeEntryTx;
}

export default function Claim({ transaction }: ClaimProps) {
  return (
    <button className="btn btn-outline h-6 text-aepink hover:bg-aepink hover:border-white hover:text-white font-semibold tracking-wider">
      Claim
    </button>
  );
}
