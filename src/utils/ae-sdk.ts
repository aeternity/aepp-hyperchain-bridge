import {
  Node,
  AeSdk,
  CompilerHttp,
  WalletConnectorFrame,
  BrowserWindowMessageConnection,
  walletDetector,
  MemoryAccount,
  encode,
  Encoding,
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

export async function createSdkInstance(network: Network): Promise<AeSdk> {
  const accounts = [Bun.env.BRIDGE_OWNER_PK, Bun.env.BRIDGE_USER_PK].map(
    (pk) =>
      new MemoryAccount(encode(Buffer.from(pk!, "hex").subarray(0, 32), Encoding.AccountSecretKey)),
  );

  return new AeSdk({
    onCompiler: new CompilerHttp(network.compilerUrl),
    nodes: [{ name: "test", instance: new Node(network.url) }],
    accounts,
  });
}
