import { NetworkWithCurrency } from "@/types/network";
import { createSdkBrowser } from "@/utils/aeternity/create-sdk-browser";
import BigNumber from "bignumber.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context/app-provider";
import { walletSdk } from "../../utils/wallet-sdk";
import { Node } from "@aeternity/aepp-sdk";
import { WalletContext } from "../../context/wallet-provider";

interface Props {
  network: NetworkWithCurrency;
  onClose: () => void;
}
const OPERATOR_ACCOUNT_ADDRESS =
  "ak_24uie2t12FPaPGBaxxR8LQZWJWrDnHuBbpTZXeD9BuyU4qk9rS";
const MINIMUM_BALANCE = 0.01;

export default function DeployContractModal({ onClose, network }: Props) {
  const { showError, showSuccess } = useContext(AppContext);
  const { addNewNode } = useContext(WalletContext);

  const [balance, setBalance] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const sdk = createSdkBrowser(network);
    sdk
      .getBalance(OPERATOR_ACCOUNT_ADDRESS)
      .then(setBalance)
      .catch(() => setBalance("0"));
  }, [network.id]);

  const formattedBalance = useMemo(() => {
    if (!balance) return 0;

    return new BigNumber(balance)
      .shiftedBy(-Number(network.currency.decimals))
      .toFormat(2);
  }, [balance, network.id]);

  const hasSufficientBalance = Number(formattedBalance) >= MINIMUM_BALANCE;

  const handleFinishClick = async () => {
    setIsBusy(true);
    const response = await fetch("/api/networks", {
      method: "POST",
      body: JSON.stringify(network),
    }).then((res) => res.json());

    if (response.ok) {
      showSuccess(
        `Network ${network.name} successfully created! You can now use it in the app.`
      );
      addNewNode(network);
      onClose();
    } else {
      showError(response.error);
    }
    setIsBusy(false);
  };

  return (
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
    >
      <div className="modal-box sm:inline-table">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-semibold text-2xl">Verification successful!</h3>
        <p className="pt-3 font-medium text-sm text-center">
          Please fund the bridge operator account address below by sending{" "}
          <b>
            {MINIMUM_BALANCE} {network.currency.symbol}
          </b>{" "}
          on the {network.name} network.
        </p>

        {balance !== "" && (
          <div className="mt-5 text-center">
            {!hasSufficientBalance ? (
              <div
                className={`alert alert-warning text-lg justify-center text-center font-medium flex flex-col`}
              >
                <span className="text-lg font-semibold">
                  Bridge Operator Account:
                </span>
                {OPERATOR_ACCOUNT_ADDRESS}
                <div className="divider my-0" />
                Balance: {formattedBalance} {network.currency.symbol}
                <br />
                <span>
                  Expecting at least {MINIMUM_BALANCE} {network.currency.symbol}
                </span>
              </div>
            ) : (
              <div className="alert alert-success text-lg font-medium">
                Bridge operator account funded. Now you may proceed to deploy
                the bridge contract and complete the network setup.
              </div>
            )}
            <div className="divider" />
            <button
              disabled={!hasSufficientBalance || isBusy}
              onClick={handleFinishClick}
              className="btn bg-aepink text-white font-medium w-[200px] mb-5 mt-2 m-auto"
            >
              {isBusy ? "Deploying..." : "Finish Network Setup"}
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
