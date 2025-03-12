import Image from "next/image";
import { useContext, useState } from "react";

import { shorten, formatBalance } from "@/utils/formatters";
import { WalletContext } from "@/context/wallet-provider";
import NetworkSelect from "./network-select";

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
      <NetworkSelect />
      <div className="border-aepink-100 ml-2 flex flex-row items-center overflow-hidden rounded-xl border font-medium text-white">
        <div className="px-2 text-gray-900">
          {formatBalance(balance, currency.decimals)} {currency.symbol}
        </div>
        <div
          onClick={handleAddressClick}
          className="bg-aepink-100 w-35 cursor-pointer rounded-l-xl px-2.5 py-1 text-center"
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
        className="hover:bg-aepink-10 m-1 ml-2 cursor-pointer rounded-sm p-1"
      />
    </div>
  );
}
