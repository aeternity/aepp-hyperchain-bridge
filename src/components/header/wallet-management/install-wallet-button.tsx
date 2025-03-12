import Button from "@/components/base/button";

export default function InstallWalletButton() {
  return (
    <Button onClick={() => window.open("https://wallet.superhero.com/", "_blank")}>
      Install Superhero Wallet
    </Button>
  );
}
