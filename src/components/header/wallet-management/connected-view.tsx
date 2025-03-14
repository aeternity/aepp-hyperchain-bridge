import Image from "next/image";
import { useContext, useState } from "react";

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
      <div className="border-aepink ml-2 flex flex-row items-center overflow-hidden rounded-xl border text-sm font-medium text-white max-sm:mr-2">
        <div className="px-2 text-gray-900">
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
      <Image
        onClick={disconnect}
        src="/off_icon.svg"
        alt="disconnect"
        width={30}
        height={30}
        className="hover:bg-aepink-100 m-1 ml-2 cursor-pointer rounded-sm p-1.5 max-sm:hidden"
      />
    </div>
  );
}
