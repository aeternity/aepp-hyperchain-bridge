import { useContext, useState } from "react";

import TokenSelect from "./token-select";
import NetworkSelect from "./network-select";

import { BridgeContext } from "@/context/bridge-provider";

export default function BridgeForm() {
  const { registeredNetworks, registeredTokens, isLoadingInitialBridgeConfig, tokenBalances } =
    useContext(BridgeContext);
  const [selectedToken, setSelectedToken] = useState(registeredTokens[0]);
  const [destinationNetwork, setDestinationNetwork] = useState(registeredNetworks[0]);
  const tokensWithBalances = registeredTokens.map((token) => {
    const tokenBalance = tokenBalances.find((balance) => balance.address === token.address);
    return { ...token, balance: tokenBalance?.balance };
  });

  return (
    <div className="flex flex-1 flex-row gap-2">
      <NetworkSelect
        className="flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        networks={registeredNetworks}
        selectedNetwork={destinationNetwork}
        onSelect={setDestinationNetwork}
      />
      <TokenSelect
        className="flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        tokens={tokensWithBalances}
        selectedToken={selectedToken}
        onSelect={setSelectedToken}
      />
    </div>
  );
}
