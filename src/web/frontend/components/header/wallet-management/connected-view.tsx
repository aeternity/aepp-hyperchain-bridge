import { useContext, useState } from "react";

import { shorten, formatBalance } from "@/utils/data/formatters";
import { WalletContext } from "@/frontend/context/wallet-provider";
import { NetworkBalanceContext } from "@/web/frontend/context/network-balance-provider";
import { ClockIcon, PowerIcon } from "@heroicons/react/24/outline";
import { BridgeActionContext } from "@/web/frontend/context/bridge-action-provider";
import useBridgeActionsHistory from "@/web/frontend/hooks/useBridgeActionsHistory";

export default function ConnectedView() {
  const { actions } = useBridgeActionsHistory();
  const { balance, currency } = useContext(NetworkBalanceContext);
  const { setHistoryVisibility } = useContext(BridgeActionContext);
  const { address, disconnect, currentNetwork, isUnsupportedNetwork } =
    useContext(WalletContext);

  const [justCopied, setJustCopied] = useState(false);

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1000);
  };

  const nonCompletedActions = actions.filter((a) => !a.isCompleted);

  return (
    <div className="flex flex-row items-center">
      {!isUnsupportedNetwork && (
        <div className="flex-row items-center hidden text-sm min-sm:flex mx-2">
          <div className={"status status-success mr-1 mb-0.5"}></div>
          {currentNetwork?.name}
        </div>
      )}

      <div className="border-aepink ml-2 flex flex-row items-center overflow-hidden rounded-xl border text-sm font-medium text-white">
        {currency && (
          <div className="px-2 font-semibold text-gray-900">
            {formatBalance({
              balance,
              decimals: currency.decimals,
              formatDecimals: 2,
            })}{" "}
            {currency.symbol}
          </div>
        )}
        <div
          onClick={handleAddressClick}
          className="bg-aepink w-30 cursor-pointer rounded-l-xl px-2.5 py-1 text-center"
        >
          {justCopied ? "Copied!" : shorten(address)}
        </div>
      </div>
      <div className="relative">
        {nonCompletedActions.length > 0 && (
          <div className="badge badge-xs badge-neutral bg-aepink border-0 pt-[.5px] absolute right-[-6px] top-[-6px]">
            {nonCompletedActions.length}
          </div>
        )}
        <ClockIcon
          width={30}
          height={30}
          stroke="gray"
          strokeWidth={2.5}
          className="hover:bg-aepink-100 ml-1  cursor-pointer rounded-sm p-1"
          onClick={() => setHistoryVisibility(true)}
        />
      </div>
      <PowerIcon
        onClick={disconnect}
        width={30}
        height={30}
        stroke="red"
        strokeWidth={2.5}
        className="hover:bg-aepink-100 mr-2 ml-1 cursor-pointer rounded-sm p-1"
      />
    </div>
  );
}
