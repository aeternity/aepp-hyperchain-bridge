import { networkDefaults } from "@/constants/networks";
import type { NetworkBase } from "@/types/network";
import { AeSdk, CompilerHttp, Node } from "@aeternity/aepp-sdk";

const sdkInstanceMap = new Map<string, AeSdk>();

export function createSdkBrowser(network: NetworkBase): AeSdk {
  if (!sdkInstanceMap.has(network.id)) {
    sdkInstanceMap.set(
      network.id,
      new AeSdk({
        onCompiler: new CompilerHttp(networkDefaults.compilerUrl),
        nodes: [{ name: "remote", instance: new Node(network.url) }],
      })
    );
  }

  return sdkInstanceMap.get(network.id)!;
}
