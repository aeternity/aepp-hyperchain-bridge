import Image from "next/image";
import WalletManagement from "./wallet-management";

export default function Header() {
  return (
    <header className="flex flex-col md:flex">
      <div className="border-b border-gray-200">
        <div className="flex h-16 items-center justify-between md:px-20">
          <Image src="hyperchains_logo.svg" alt="Hyperchain Bridge" width={190} height={30} />
          <WalletManagement />
        </div>
      </div>
    </header>
  );
}
