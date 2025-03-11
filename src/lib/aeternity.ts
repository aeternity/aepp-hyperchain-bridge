import { Node, AeSdk, CompilerHttp } from "@aeternity/aepp-sdk";

import { aeMain, aeTest, hcPerf, networkDefaults } from "@/constants/networks";

export const aeSdk = new AeSdk({
  onCompiler: new CompilerHttp(networkDefaults.compilerUrl),
  nodes: [aeMain, aeTest, hcPerf].map((node) => ({
    name: node.id,
    instance: new Node(node.url),
  })),
});
