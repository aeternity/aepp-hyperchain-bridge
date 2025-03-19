import {
  Node,
  AeSdk,
  CompilerHttp,
  walletDetector,
  WalletConnectorFrame,
  BrowserWindowMessageConnection,
} from "@aeternity/aepp-sdk";

import { ALL_NETWORKS, networkDefaults } from "@aepp-hyperchain-bridge/shared";
import { Wallet } from "./types";

export const walletSdk = new AeSdk({
  onCompiler: new CompilerHttp(networkDefaults.compilerUrl),
  nodes: ALL_NETWORKS.map((node) => ({
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

export const getConnector = async (
  wallet: Wallet | null
): Promise<WalletConnectorFrame | null> => {
  if (!wallet) return null;
  return WalletConnectorFrame.connect(
    "Hyperchain Bridge Aepp",
    wallet.getConnection()
  );
};
