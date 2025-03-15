import { useContext, useState } from "react";
import PowerIcon from "@heroicons/react/24/outline/PowerIcon";

import { shorten, formatBalance } from "@/utils/formatters";
import { WalletContext } from "@/context/wallet-provider";
import NetworkDisplay from "./network-display";

export default function ConnectedView() {
  const { address, balance, disconnect, currency } = useContext(WalletContext);
  const [justCopied, setJustCopied] = useState(false);

  const handleAddressClick = () => {
    navigator.clipboard.writeText(address);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1000);
  };

  return (
    <div className="flex flex-row items-center">
      <NetworkDisplay />
      <div className="border-aepink ml-2 flex flex-row items-center overflow-hidden rounded-xl border text-sm font-medium text-white">
        <div className="px-2 font-semibold text-gray-900">
          {formatBalance({ balance, decimals: currency.decimals, formatDecimals: 2 })}{" "}
          {currency.symbol}
        </div>
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
