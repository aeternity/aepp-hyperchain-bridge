import { WalletContext } from "@/context/wallet-provider";
import Image from "next/image";
import { useContext, useState } from "react";

import { aeMain, aeTest, hcPerf } from "@/constants/networks";

export default function NetworkSelect() {
  const { networkId, requestNetworkChange } = useContext(WalletContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative mx-3">
      <div
        onClick={toggleDropdown}
        className="flex cursor-pointer flex-row font-medium text-gray-900 select-none before:mr-2 before:inline-flex before:h-2 before:w-2 before:self-center before:rounded-full before:bg-green-300"
      >
        {networkId}
        <Image
          src="arrow_down.svg"
          alt="arrow-down"
          width={12}
          height={12}
          className="ml-2 dark:invert"
        />
      </div>

      {isOpen && (
        <div className="absolute top-8 right-0 w-32 rounded-md border border-gray-200 bg-white shadow-lg">
          {[aeMain, aeTest, hcPerf].map((network) => (
            <div
              key={network.id}
              onClick={() => requestNetworkChange(network.id)}
              className="cursor-pointer p-2 text-sm text-gray-900 hover:bg-gray-100"
            >
              {network.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
