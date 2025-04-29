import { useNavigate } from "react-router";
import hcLogo from "@/frontend/assets/hc-logo.svg";
import WalletManagement from "./wallet-management";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="flex flex-col md:flex bg-white">
      <div className="border-b border-gray-300">
        <div className="flex h-16 items-center justify-between md:px-20">
          <div
            className="flex items-center font-semibold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={hcLogo} alt="Hyperchain Bridge" width={40} height={40} />
            <div className="flex flex-col max-sm:hidden">
              <span className="mt-[-5px] text-lg">Hyperchains</span>
              <span className="mt-[-8px] text-xs">Bridge</span>
            </div>
          </div>
          <WalletManagement />
        </div>
      </div>
    </header>
  );
}
