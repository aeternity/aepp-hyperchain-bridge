import {
  encode,
  Encoding,
  MemoryAccount,
  AeSdk,
  CompilerHttp,
  Node,
} from "@aeternity/aepp-sdk";

import type { Network } from "@/types/network";

export async function createSdkInstance(
  network: Network,
  addAccounts: boolean = true
): Promise<AeSdk> {
  let accounts: MemoryAccount[] = [];

  if (addAccounts) {
    accounts = [Bun.env.BRIDGE_OWNER_PK, Bun.env.BRIDGE_USER_PK].map(
      (pk) =>
        new MemoryAccount(
          encode(
            Buffer.from(pk!, "hex").subarray(0, 32),
            Encoding.AccountSecretKey
          )
        )
    );
  }

  return new AeSdk({
    onCompiler: new CompilerHttp(network.compilerUrl),
    nodes: [{ name: "remote", instance: new Node(network.url) }],
    accounts,
  });
}
