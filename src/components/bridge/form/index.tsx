import BigNumber from "bignumber.js";
import { useCallback, useContext, useEffect, useState } from "react";

import { validateForm } from "./utils";
import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import { byAddress } from "@/utils/filters";
import NetworkSelect from "./network-select";
import { Button } from "@/components/base/button";
import { BridgeContext } from "@/context/bridge-provider";

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
  const selectedTokenWithBalance = tokensWithBalances.find(byAddress(selectedTokenAddress))!;

  const validate = useCallback(
    () => validateForm(selectedNetworkId, selectedTokenAddress, amount, setErrors),
    [selectedNetworkId, selectedTokenAddress, amount],
  );
  const hasErrors = useCallback(
    (_errors: { [key: string]: string } = errors) => Object.keys(_errors).length > 0,
    [errors],
  );

  useEffect(() => {
    setAmount("");
  }, [selectedTokenAddress]);

  useEffect(() => {
    if (hasErrors()) {
      validate();
    }
  }, [selectedNetworkId, selectedTokenAddress, amount, hasErrors, validate]);

  const handleBridgeClick = async () => {
    const _errors = validate();
    if (!hasErrors(_errors)) {
      const amountWithDecimals = new BigNumber(amount)
        .shiftedBy(selectedTokenWithBalance.decimals)
        .toString();

      const isSucceeded = await bridgeDeposit(
        selectedNetworkId,
        selectedTokenAddress,
        amountWithDecimals,
      );
      if (isSucceeded) setAmount("");
    }
  };

  return (
    <fieldset className="fieldset rounded-sm bg-gray-50 p-4 shadow-sm">
      <div className="flex flex-1 flex-col gap-6">
        <NetworkSelect
          error={errors?.network}
          className="w-full max-sm:w-fit"
          isLoading={isLoadingInitialBridgeConfig}
          networks={registeredNetworks}
          onSelect={setSelectedNetworkId}
        />
        <TokenSelect
          className="w-full max-sm:w-fit"
          error={errors?.token}
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
          Confirm Transaction
        </Button>
      </div>
    </fieldset>
  );
}
