import { useContext, useState } from "react";
import PowerIcon from "@heroicons/react/24/outline/PowerIcon";

import { shorten, formatBalance } from "@/utils/data/formatters";
import { WalletContext } from "@/frontend/context/wallet-provider";
import { NetworkContext } from "@/web/frontend/context/network-provider";
import useNetworks from "@/web/frontend/hooks/useNetworks";

export default function ConnectedView() {
  const { currentNetwork, isUnsupportedNetwork } = useNetworks();
  const { address, disconnect } = useContext(WalletContext);
  const { balance, currency } = useContext(NetworkContext);
  const [justCopied, setJustCopied] = useState(false);

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1000);
  };

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
          className="bg-aepink w-35 cursor-pointer rounded-l-xl px-2.5 py-1 text-center"
        >
          {justCopied ? "Copied!" : shorten(address)}
        </div>
      </div>
      <PowerIcon
        onClick={disconnect}
        width={30}
        height={30}
        stroke="red"
        strokeWidth={2.5}
        className="hover:bg-aepink-100 mx-2 cursor-pointer rounded-sm p-1"
      />
    </div>
  );
}
