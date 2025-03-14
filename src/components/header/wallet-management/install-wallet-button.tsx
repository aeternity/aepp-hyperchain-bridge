import OutlinedButton from "@/components/base/outlined-button";

export default function InstallWalletButton() {
  return (
    <OutlinedButton onClick={() => window.open("https://wallet.superhero.com/", "_blank")}>
      Install Superhero Wallet
    </OutlinedButton>
  );
}
