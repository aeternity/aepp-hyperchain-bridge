import Image from "next/image";
import ConnectWallet from "./connect-wallet";

export default function Header() {
  return (
    <div className="border-b border-gray-200">
      <div className="flex h-16 items-center justify-between md:px-20">
        <Image
          src="/hyperchains_logo.svg"
          alt="Hyperchain Bridge"
          width={150}
          height={40}
        />
        <ConnectWallet />
      </div>
    </div>
  );
}
