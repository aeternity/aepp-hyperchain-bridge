import { useState } from "react";

import FormTitle from "./title";
import TokenSelect from "./token-select";
import NetworkSelect from "./network-select";
import { Network } from "@/constants/networks";
import { tokens } from "@/constants/tokens";

interface Props {
  registeredNetworks: Network[];
  registeredTokens: Token[];
}

export default function BridgeForm({ registeredNetworks }: Props) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [destinationNetwork, setDestinationNetwork] = useState(registeredNetworks[0]);

  return (
    <div>
      <FormTitle />
      <div className="flex flex-1 flex-row gap-2">
        <NetworkSelect
          className="flex-1"
          networks={registeredNetworks}
          selectedNetwork={destinationNetwork}
          onSelect={setDestinationNetwork}
        />
        <TokenSelect
          className="flex-1"
          tokens={tokens}
          selectedToken={selectedToken}
          onSelect={setSelectedToken}
        />
      </div>
    </div>
  );
}
