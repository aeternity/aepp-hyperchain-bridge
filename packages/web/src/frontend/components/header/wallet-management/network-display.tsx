import { useContext } from "react";

import { getNetworkById } from "@aepp-hyperchain-bridge/shared";
import { WalletContext } from "@/frontend/context/wallet-provider";

export default function NetworkDisplay() {
  const { networkId } = useContext(WalletContext);
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mx-3 hidden text-sm min-sm:flex">
      <div
        // onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row items-center"
      >
        <div
          aria-label="success"
          className="status status-success mr-1 mb-0.5"
        ></div>
        {getNetworkById(networkId)?.name}
        {/* <Image
          src="arrow_down.svg"
          alt="arrow-down"
          width={12}
          height={12}
          className="ml-2 dark:invert"
        /> */}
      </div>

      {/* {isOpen && (
        <div className="absolute top-8 right-0 w-32 rounded-md border border-gray-200 bg-white shadow-lg">
          {networks.map((network) => (
            <div
              key={network.id}
              onClick={() => requestNetworkChange(network.id)}
              className="cursor-pointer p-2 text-sm text-gray-900 hover:bg-gray-100"
            >
              {network.name}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
