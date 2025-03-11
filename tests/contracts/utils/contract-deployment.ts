import fs from "fs";
import path from "path";
import ContractWithMethods, {
  ContractMethodsBase,
} from "@aeternity/aepp-sdk/es/contract/Contract";
import { getFileSystem, Contract, AeSdk } from "@aeternity/aepp-sdk";

async function getContractOptions(filePath: string) {
  const sourceCode = fs.readFileSync(filePath, "utf-8");
  const fileSystem = await getFileSystem(filePath);

  return { sourceCode, fileSystem };
}

export async function createContract(
  sdk: AeSdk,
  contractPath: string,
  txOptions = {}
) {
  return Contract.initialize({
    ...sdk.getContext(),
    ...(await getContractOptions(contractPath)),
    ...txOptions,
  });
}

function saveDeployments(
  networkId: string,
  contracts: ContractWithMethods<ContractMethodsBase>[]
) {
  const content = fs.readFileSync(path.resolve("deployments.json"));
  const deployments = JSON.parse(content.toString() || "[]");
  const timestamp = Date.now();

  contracts.forEach((contract) => {
    deployments.push({
      networkId,
      timestamp,
      aci: contract._aci,
      name: contract._name,
      address: contract.$options.address,
      bytecode: contract.$options.bytecode,
    });
  });

  fs.writeFileSync("deployments.json", JSON.stringify(deployments, null, 2));
}

function loadDeployments(networkId: string, contractNames: string[]) {
  const content = fs.readFileSync(path.resolve("deployments.json"));
  const deployments = JSON.parse(content.toString() || "[]");

  return contractNames.map(
    (ctName: string) =>
      deployments
        .filter((d: any) => d.networkId === networkId && d.name === ctName)
        .sort((a: any, b: any) => b.timestamp - a.timestamp)[0]
  );
}

export async function createOrUseExistingContracts(aeSdk: AeSdk) {
  const output: any = {};
  const networkId = await aeSdk.api.getNetworkId();
  const bridgeTokenSource = "contracts/BridgeToken.aes";
  const hyperchainBridgeSource = "contracts/HyperchainBridge.aes";

  const [bridgeDeployment, testTokenDeployment] = loadDeployments(networkId, [
    "HyperchainBridge",
    "BridgeToken",
  ]);

  if (bridgeDeployment) {
    output.Bridge = await Contract.initialize({
      ...aeSdk.getContext(),
      address: bridgeDeployment.address,
      aci: bridgeDeployment.aci,
    });
  } else {
    output.Bridge = await createContract(aeSdk, hyperchainBridgeSource);
    await output.Bridge.init();
    await saveDeployments(networkId, [output.Bridge]);
  }

  if (testTokenDeployment) {
    output.TestToken = await Contract.initialize({
      ...aeSdk.getContext(),
      address: testTokenDeployment.address,
      aci: testTokenDeployment.aci,
    });
  } else {
    output.TestToken = await createContract(aeSdk, bridgeTokenSource);
    await output.TestToken.init("TestToken", 18, "TST", 1e27);
    await saveDeployments(networkId, [output.TestToken]);
  }

  return output;
}
