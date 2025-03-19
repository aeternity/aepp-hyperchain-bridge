import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

import { validateForm } from "./validation";
import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import NetworkSelect from "./network-select";
import { byAddress } from "@aepp-hyperchain-bridge/shared";
import useTokensWithBalances from "@/hooks/useTokensWithBalances";
import useRegisteredNetworks from "@/hooks/useRegisteredNetworks";
import useBridgeActions from "@/hooks/useBridgeActions";

export default function BridgeForm() {
  const networks = useRegisteredNetworks();
  const { isActionInProgress, deposit } = useBridgeActions();
  const { tokensWithBalances: tokens, reload } = useTokensWithBalances();

  const [amount, setAmount] = useState("");
  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [selectedTokenAddress, setSelectedTokenAddress] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const selectedToken = tokens.find(byAddress(selectedTokenAddress))!;

  const validate = useCallback(
    () => validateForm(selectedNetworkId, selectedTokenAddress, amount),
    [selectedNetworkId, selectedTokenAddress, amount]
  );

  useEffect(() => {
    setAmount("");
  }, [selectedTokenAddress]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors(validate());
    }
  }, [selectedNetworkId, selectedTokenAddress, amount]);

  const handleBridgeClick = useCallback(async () => {
    const _errors = validate();
    if (Object.keys(_errors).length === 0) {
      const amountWithDecimals = new BigNumber(amount)
        .shiftedBy(selectedToken.decimals)
        .toString();

      const isSucceeded = await deposit(
        selectedNetworkId,
        selectedTokenAddress,
        amountWithDecimals
      );
      if (isSucceeded) {
        reload();
        setAmount("");
      }
    } else {
      setErrors(_errors);
    }
  }, [amount, selectedNetworkId, selectedTokenAddress]);

  return (
    <fieldset className="fieldset rounded-sm bg-gray-50 shadow-sm pt-3">
      <div className="flex flex-1 flex-row flex-wrap justify-center">
        <NetworkSelect
          className="w-1/2 px-4 max-[400px]:w-full"
          error={errors.network}
          networks={networks}
          onSelect={setSelectedNetworkId}
        />
        <TokenSelect
          className="w-1/2 px-4 max-[400px]:w-full"
          error={errors.token}
          tokens={tokens}
          onSelect={setSelectedTokenAddress}
        />

        <AmountInput
          className="w-full px-4"
          error={errors.amount}
          onChange={setAmount}
          amount={amount}
          max={selectedToken?.balance
            .shiftedBy(-selectedToken.decimals)
            ?.toNumber()}
        />
        <button
          disabled={isActionInProgress}
          className="btn bg-aepink text-white font-medium w-[200px] mb-4 mt-2"
          color="primary"
          onClick={handleBridgeClick}
        >
          Confirm Transaction
        </button>
      </div>
    </fieldset>
  );
}
