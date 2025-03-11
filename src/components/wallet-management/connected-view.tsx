import { useContext } from "react";

import { shorten, formatBalance } from "@/utils/formatters";
import { WalletContext } from "@/context/wallet-provider";
import NetworkSelect from "./network-select";

export default function ConnectedView() {
  const { address, balance, disconnect } = useContext(WalletContext);

  return (
    <div className="flex flex-row items-center">
      <NetworkSelect />
      <div className="border-aepink-100 ml-2 flex flex-row items-center overflow-hidden rounded-xl border font-medium text-white">
        <div className="px-2 text-gray-900">{formatBalance(balance)} AE</div>
        <div onClick={disconnect} className="bg-aepink-100 cursor-pointer rounded-l-xl px-2.5 py-1">
          {shorten(address)}
        </div>
      </div>
    </div>
  );
}
