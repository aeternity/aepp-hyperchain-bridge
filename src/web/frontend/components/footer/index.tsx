import aeLogo from "@/frontend/assets/ae-logo.svg";
import { Link } from "react-router";
import packageJson from "package.json";

export default function Footer() {
  return (
    <footer className="flex bg-black/85 p-7 font-medium text-white justify-between">
      <div className="flex-row flex items-center">
        <div className="flex-col">
          <p className="text-xs">Powered by</p>
          <img src={aeLogo} alt="logo" width={100} />
        </div>
        <div className="divider divider-horizontal  before:bg-white after:bg-white" />
        <div className="text-sm">v{packageJson.version}</div>
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
