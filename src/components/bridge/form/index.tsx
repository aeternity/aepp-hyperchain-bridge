import { useContext, useEffect, useState } from "react";

import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import NetworkSelect from "./network-select";

import { byAddress } from "@/utils/filters";
import { Button } from "@/components/base/button";
import { mapTokensWithBalances } from "@/utils/mappers";
import { BridgeContext } from "@/context/bridge-provider";
import { validateForm } from "./utils";

export default function BridgeForm() {
  const { registeredNetworks, registeredTokens, isLoadingInitialBridgeConfig, tokenBalances } =
    useContext(BridgeContext);

  const [amount, setAmount] = useState("");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const tokensWithBalances = mapTokensWithBalances(registeredTokens, tokenBalances);
  const selectedTokenWithBalance = tokensWithBalances.find(byAddress(selectedTokenAddress));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const hasErrors = Object.keys(errors).length > 0;

  const validate = () => validateForm(selectedNetworkId, selectedTokenAddress, amount, setErrors);

  useEffect(() => {
    setAmount("");
  }, [selectedTokenAddress]);

  useEffect(() => {
    if (hasErrors) {
      validate();
    }
  }, [selectedNetworkId, selectedTokenAddress, amount]);

  const handleBridgeClick = async () => {
    validate();
    if (!hasErrors) {
      // Bridge funds
      console.log("Bridge funds");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NetworkSelect
        error={errors?.network}
        className="w-fit flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        networks={registeredNetworks}
        onSelect={setSelectedNetworkId}
      />
      <TokenSelect
        error={errors?.token}
        className="flex-1"
        isLoading={isLoadingInitialBridgeConfig}
        tokens={tokensWithBalances}
        onSelect={setSelectedTokenAddress}
      />
      <AmountInput
        error={errors.amount}
        onChange={setAmount}
        amount={amount}
        max={selectedTokenWithBalance?.balance?.toNumber()}
      />
      <Button
        className="w-[200px] cursor-pointer self-center"
        color="primary"
        onClick={handleBridgeClick}
      >
        Bridge Funds
      </Button>
    </div>
  );
}
