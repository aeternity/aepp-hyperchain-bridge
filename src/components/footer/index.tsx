import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex bg-black/85 p-7 font-medium text-white">
      <div className="flex-col">
        <p className="text-xs">Powered by</p>
        <Image src="/ae-logo.svg" alt="logo" width={100} height={100} />
      </div>
    </footer>
  );
}
