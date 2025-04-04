import { AeSdk, CompilerHttp, Node } from "@aeternity/aepp-sdk";

import type { Network } from "@/types/network";

export async function createSdkBrowser(network: Network): Promise<AeSdk> {
  return new AeSdk({
    onCompiler: new CompilerHttp(network.compilerUrl),
    nodes: [{ name: "remote", instance: new Node(network.url) }],
  });
}
