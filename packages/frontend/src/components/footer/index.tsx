import aeLogo from "@/public/ae-logo.svg";

export default function Footer() {
  return (
    <footer className="flex bg-black/85 p-7 font-medium text-white">
      <div className="flex-col">
        <p className="text-xs">Powered by</p>
        <img src={aeLogo} alt="logo" width={100} />
      </div>
    </footer>
  );
}
