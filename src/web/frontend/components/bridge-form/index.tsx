import BigNumber from "bignumber.js";
import { useCallback, useContext, useEffect, useState } from "react";

import { validateForm } from "./validation";
import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import NetworkSelect from "./network-select";
import { byAddress } from "@/utils/data/filters";
import BridgeHistory from "../bridge-history";

import { useTokenBalances } from "@/frontend/hooks/useTokenBalances";
import useNetworks from "@/frontend/hooks/useNetworks";
import { WalletContext } from "@/frontend/context/wallet-provider";
import useBridgeContract from "@/frontend/hooks/useBridgeContract";

export default function BridgeForm() {
  const networks = useNetworks();
  const { tokens, refetch } = useTokenBalances();
  const { reloadBalance } = useContext(WalletContext);
  const { enterBridge, isBusy } = useBridgeContract();

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
        .shiftedBy(Number(selectedToken.decimals))
        .toString();

      const isSucceeded = await enterBridge(
        selectedNetworkId,
        selectedToken,
        amountWithDecimals
      );
      if (isSucceeded) {
        refetch();
        reloadBalance();
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
          max={selectedToken?.amount
            .shiftedBy(-Number(selectedToken.decimals))
            ?.toNumber()}
        />

        <button
          disabled={isBusy}
          className="btn bg-aepink text-white font-medium w-[200px] mb-2 mt-2"
          color="primary"
          onClick={handleBridgeClick}
        >
          Confirm Transaction
        </button>

        <BridgeHistory isContractBusy={isBusy} />
      </div>
    </fieldset>
  );
}
