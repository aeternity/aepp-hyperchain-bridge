import { useContext, useEffect, useState } from "react";

import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import NetworkSelect from "./network-select";

import { byAddress } from "@/utils/filters";
import { Button } from "@/components/base/button";
import { mapTokensWithBalances } from "@/utils/mappers";
import { BridgeContext } from "@/context/bridge-provider";
import { validateForm } from "./utils";
import BigNumber from "bignumber.js";

export default function BridgeForm() {
  const {
    bridgeDeposit,
    registeredNetworks,
    tokensWithBalances,
    isActionInProgress,
    isLoadingInitialBridgeConfig,
  } = useContext(BridgeContext);

  const [amount, setAmount] = useState("");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const selectedTokenWithBalance = tokensWithBalances.find(byAddress(selectedTokenAddress));

  const validate = () => validateForm(selectedNetworkId, selectedTokenAddress, amount, setErrors);
  const hasErrors = (_errors: { [key: string]: string } = errors) =>
    Object.keys(_errors).length > 0;

  useEffect(() => {
    setAmount("");
  }, [selectedTokenAddress]);

  useEffect(() => {
    if (hasErrors()) {
      validate();
    }
  }, [selectedNetworkId, selectedTokenAddress, amount]);

  const handleBridgeClick = async () => {
    const _errors = validate();
    if (!hasErrors(_errors)) {
      const amountWithDecimals = new BigNumber(amount)
        .shiftedBy(selectedTokenWithBalance?.decimals!)
        .toString();

      const isSucceeded = await bridgeDeposit(
        selectedNetworkId,
        selectedTokenAddress,
        amountWithDecimals,
      );
      isSucceeded && setAmount("");
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
        disabled={isActionInProgress}
        className="w-[200px] cursor-pointer self-center"
        color="primary"
        onClick={handleBridgeClick}
      >
        Bridge Funds
      </Button>
    </div>
  );
}
