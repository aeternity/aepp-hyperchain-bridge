import fs from "fs";
import { parseArgs } from "util";
import { AeSdk, Contract, getFileSystem } from "@aeternity/aepp-sdk";

export function parseArguments() {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      network: {
        type: "string",
      },
      name: {
        type: "string",
      },
      symbol: {
        type: "string",
      },
      decimals: {
        type: "string",
      },
      initialOwnerBalance: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values;
}

export async function deployContract(aeSdk: AeSdk, sourcePath: string) {
  const sourceCode = fs.readFileSync(sourcePath, "utf-8");
  const fileSystem = await getFileSystem(sourcePath);

  return await Contract.initialize({
    ...aeSdk.getContext(),
    sourceCode,
    fileSystem,
  });
}
