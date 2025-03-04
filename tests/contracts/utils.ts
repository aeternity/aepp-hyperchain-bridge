import { readFileSync } from "fs";
import {
  AeSdk,
  MemoryAccount,
  CompilerHttp,
  Node,
  getFileSystem,
  Contract,
} from "@aeternity/aepp-sdk";
import { aeTest, hcPerf, hcLocal } from "../../configs/network";

const network = aeTest;

export async function getSdk(accountCount = 1): Promise<AeSdk> {
  const fundingAccount = await network.getFundingAccount();
  const accounts = new Array(accountCount - 1)
    .fill(null)
    .map(() => MemoryAccount.generate());
  accounts.unshift(fundingAccount);

  const sdk = new AeSdk({
    onCompiler: new CompilerHttp(network.compilerUrl),
    nodes: [{ name: "test", instance: new Node(network.url) }],
    accounts,
  });

  for (let i = 0; i < accounts.length; i += 1) {
    await sdk.spend(1e18, accounts[i].address, {
      onAccount: fundingAccount,
      verify: false,
    });
  }

  return sdk;
}

async function getContractOptions(path: string) {
  const sourceCode = readFileSync(path, "utf-8");
  const fileSystem = await getFileSystem(path);

  return { sourceCode, fileSystem };
}

export async function createContract(contractPath: string, sdk: AeSdk) {
  return Contract.initialize({
    ...sdk.getContext(),
    ...(await getContractOptions(contractPath)),
  });
}
