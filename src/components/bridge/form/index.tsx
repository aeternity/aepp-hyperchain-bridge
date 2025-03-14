import { useContext, useEffect, useState } from "react";

import TokenSelect from "./token-select";
import NetworkSelect from "./network-select";

import { BridgeContext } from "@/context/bridge-provider";
import AmountInput from "./amount-input";
import { mapTokensWithBalances } from "@/utils/mappers";
import { byAddress } from "@/utils/filters";

export default function BridgeForm() {
  const { registeredNetworks, registeredTokens, isLoadingInitialBridgeConfig, tokenBalances } =
    useContext(BridgeContext);

  const [amount, setAmount] = useState("");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const tokensWithBalances = mapTokensWithBalances(registeredTokens, tokenBalances);
  const selectedTokenWithBalance = tokensWithBalances.find(byAddress(selectedTokenAddress));

  useEffect(() => {
    setAmount("");
  }, [selectedTokenAddress]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NetworkSelect
        className="w-fit flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        networks={registeredNetworks}
        onSelect={setSelectedNetworkId}
      />
      <TokenSelect
        className="flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        tokens={tokensWithBalances}
        onSelect={setSelectedTokenAddress}
      />

      <AmountInput
        onChange={setAmount}
        amount={amount}
        max={selectedTokenWithBalance?.balance?.toNumber()}
      />
    </div>
  );
}
