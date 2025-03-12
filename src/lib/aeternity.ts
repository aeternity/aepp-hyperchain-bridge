import {
  Node,
  AeSdk,
  CompilerHttp,
  WalletConnectorFrame,
  BrowserWindowMessageConnection,
  walletDetector,
} from "@aeternity/aepp-sdk";

import { aeMain, aeTest, hcPerf, networkDefaults } from "@/constants/networks";

export const aeSdk = new AeSdk({
  onCompiler: new CompilerHttp(networkDefaults.compilerUrl),
  nodes: [aeMain, aeTest, hcPerf].map((node) => ({
    name: node.id,
    instance: new Node(node.url),
  })),
});

export const getWallet = (): Promise<Wallet | null> =>
  new Promise<Wallet | null>((resolveWallet) => {
    const scannerConnection = new BrowserWindowMessageConnection();
    const stopScan = walletDetector(scannerConnection, ({ newWallet }) => {
      clearTimeout(walletDetectionTimeout);
      resolveWallet(newWallet);
      stopScan();
    });

    const walletDetectionTimeout = setTimeout(() => resolveWallet(null), 2000);
  });

export const getConnector = async (wallet: Wallet | null): Promise<WalletConnectorFrame | null> => {
  if (!wallet) return null;
  return WalletConnectorFrame.connect("Hyperchain Bridge Aepp", wallet.getConnection());
};
