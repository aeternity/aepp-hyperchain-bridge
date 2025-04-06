import type { Network } from "@/types/network";
import { AeSdk, CompilerHttp, Node } from "@aeternity/aepp-sdk";

const sdkInstanceMap = new Map<string, AeSdk>();

export async function createSdkBrowser(network: Network): Promise<AeSdk> {
  if (!sdkInstanceMap.has(network.id)) {
    sdkInstanceMap.set(
      network.id,
      new AeSdk({
        onCompiler: new CompilerHttp(network.compilerUrl),
        nodes: [{ name: "remote", instance: new Node(network.url) }],
      })
    );
  }

  return sdkInstanceMap.get(network.id)!;
}
