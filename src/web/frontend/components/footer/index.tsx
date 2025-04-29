import aeLogo from "@/frontend/assets/ae-logo.svg";
import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="flex bg-black/85 p-7 font-medium text-white justify-between">
      <div className="flex-col">
        <p className="text-xs">Powered by</p>
        <img src={aeLogo} alt="logo" width={100} />
      </div>

      <ul className="flex flex-row gap-5  [&>li]:underline-offset-3 [&>li]:underline  [&>li]:hover:text-aepink [&>li]:hover:no-underline">
        <li>
          <Link to="/docs">Documentation</Link>
        </li>
        <li>
          <Link to="/faq">FAQ</Link>
        </li>
      </ul>
    </footer>
  );
}
