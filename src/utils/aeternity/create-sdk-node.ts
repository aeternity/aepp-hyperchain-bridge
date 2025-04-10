import {
  encode,
  Encoding,
  MemoryAccount,
  AeSdk,
  CompilerHttp,
  Node,
} from "@aeternity/aepp-sdk";

import type { NetworkBase } from "@/types/network";
import { networkDefaults } from "@/constants/networks";

const sdkInstanceMap = new Map<string, AeSdk>();

export async function createSdkInstance(
  network: NetworkBase,
  addAccounts: boolean = true
): Promise<AeSdk> {
  if (!sdkInstanceMap.has(network.id)) {
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

    sdkInstanceMap.set(
      network.id,
      new AeSdk({
        onCompiler: new CompilerHttp(networkDefaults.compilerUrl),
        nodes: [{ name: "remote", instance: new Node(network.url) }],
        accounts,
      })
    );
  }

  return sdkInstanceMap.get(network.id)!;
}
