import { readFileSync } from "fs";
import { getFileSystem, Contract, AeSdk } from "@aeternity/aepp-sdk";

async function getContractOptions(path: string) {
  const sourceCode = readFileSync(path, "utf-8");
  const fileSystem = await getFileSystem(path);

  return { sourceCode, fileSystem };
}

export async function createContract(
  contractPath: string,
  sdk: AeSdk,
  txOptions = {}
) {
  return Contract.initialize({
    ...sdk.getContext(),
    ...(await getContractOptions(contractPath)),
    ...txOptions,
  });
}
