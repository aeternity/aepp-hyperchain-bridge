import BigNumber from "bignumber.js";
import { useCallback, useContext, useEffect, useState } from "react";

import TokenSelect from "./token-select";
import AmountInput from "./amount-input";
import NetworkSelect from "./network-select";
import { validateForm } from "./validation";
import { byAddress } from "@/utils/data/filters";

import Title from "../base/title";
import { WalletContext } from "../../context/wallet-provider";
import { useTokenBalances } from "@/frontend/hooks/useTokenBalances";
import { NetworkBalanceContext } from "../../context/balance-provider";
import { BridgeActionContext } from "../../context/action-provider";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function BridgeForm() {
  const { reloadBalance } = useContext(NetworkBalanceContext);
  const { enterBridge, isBusy } = useContext(BridgeActionContext);
  const { otherNetworks, currentNetwork } = useContext(WalletContext);
  const { tokens, refetch: refetchTokenBalances } = useTokenBalances();

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

  useEffect(() => {
    setSelectedNetworkId("");
    setSelectedTokenAddress("");
  }, [currentNetwork]);

  const handleBridgeClick = useCallback(async () => {
    const _errors = validate();
    if (Object.keys(_errors).length !== 0) {
      setErrors(_errors);
      return;
    }

    const amountWithDecimals = new BigNumber(amount)
      .shiftedBy(Number(selectedToken.decimals))
      .toString();

    const [isSucceeded] = await enterBridge(
      selectedNetworkId,
      selectedToken,
      amountWithDecimals
    );

    if (!isSucceeded) return;

    refetchTokenBalances();
    reloadBalance();
    setAmount("");
  }, [amount, selectedNetworkId, selectedTokenAddress]);

  return (
    <>
      <Title
        title="Bridge"
        subtitle="Bridge your assets between Aeternity mainnet and Hyperchains"
      />

      <fieldset className="fieldset rounded-sm bg-gray-50 shadow-sm pt-3">
        <div className="flex flex-1 flex-row flex-wrap justify-center">
          <NetworkSelect
            className="w-1/2 px-4 max-[400px]:w-full"
            error={errors.network}
            networks={otherNetworks}
            value={selectedNetworkId}
            onSelect={setSelectedNetworkId}
          />
          <TokenSelect
            className="w-1/2 px-4 max-[400px]:w-full"
            error={errors.token}
            tokens={tokens}
            value={selectedTokenAddress}
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
            className="btn bg-aepink text-white font-medium w-[200px] mb-3 mt-2"
            color="primary"
            onClick={handleBridgeClick}
          >
            Confirm Transaction
          </button>
        </div>
      </fieldset>
      <p className="alert alert-error alert-outline font-medium mt-4">
        <ExclamationTriangleIcon className="h-10 w-10 flex-shrink-0 stroke-current" />
        Please do not bridge AE tokens from Mainnet to Testnet or from Testnet
        to Mainnet. These transfers may result in the loss of your assets.
        Always ensure you are bridging within the correct network environment.
      </p>
    </>
  );
}
