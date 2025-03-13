import fs from "fs";
import path from "path";

import { getFileSystem, Contract, AeSdk } from "@aeternity/aepp-sdk";

export async function contractsSetup(aeSdk: AeSdk) {
  // Account addresses
  const ownerAddress: `ak_${string}` = aeSdk.addresses()[0];
  const userAddress: `ak_${string}` = aeSdk.addresses()[1];

  // Load or create contracts
  const { Bridge, TestToken } = await createOrUseExistingContracts(aeSdk);

  // Contract addresses
  const testTokenAddress = TestToken.$options.address!;
  const bridgeAddress = Bridge.$options.address!;
  const bridgeAccountAddress = bridgeAddress.replace("ct_", "ak_");

  await configureContractsForTesting(
    Bridge,
    TestToken,
    bridgeAccountAddress,
    testTokenAddress,
    userAddress,
    ownerAddress,
    aeSdk,
  );

  return {
    Bridge,
    TestToken,
    ownerAddress,
    userAddress,
    testTokenAddress,
    bridgeAddress,
    bridgeAccountAddress,
  };
}

async function configureContractsForTesting(
  Bridge: GenericContract,
  TestToken: GenericContract,
  bridgeAccountAddress: string,
  testTokenAddress: string,
  userAddress: string,
  ownerAddress: string,
  aeSdk: AeSdk,
) {
  // Register testnet network
  aeSdk.selectAccount(ownerAddress as `ak_${string}`);
  const { decodedResult: registeredNetworks } = await Bridge.registered_networks();
  if (!registeredNetworks.includes("aehc_perf")) {
    await Bridge.register_network("aehc_perf");
  }

  // Register test token
  const { decodedResult: registeredTokens } = await Bridge.registered_tokens();
  if (!registeredTokens.includes(testTokenAddress)) {
    await Bridge.register_token(testTokenAddress);
  }

  // Transfer test tokens to user
  const { decodedResult: userTestTokenBalance } = await TestToken.balance(userAddress);
  if (!userTestTokenBalance || userTestTokenBalance === BigInt(0)) {
    await TestToken.transfer(userAddress, 1e24);
  }

  // Create allowance for bridge account
  aeSdk.selectAccount(userAddress as `ak_${string}`);
  const { decodedResult: allowance } = await TestToken.allowance({
    from_account: userAddress,
    for_account: bridgeAccountAddress,
  });
  if (!allowance || allowance === BigInt(0)) {
    await TestToken.create_allowance(bridgeAccountAddress, 1e27);
  }
}

function saveDeployments(networkId: string, contracts: GenericContract[]) {
  const content = fs.readFileSync(path.resolve("tests/deployments-cache.json"));
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

  fs.writeFileSync("tests/deployments-cache.json", JSON.stringify(deployments, null, 2));
}

function loadDeployments(networkId: string, contractNames: string[]) {
  const content = fs.readFileSync(path.resolve("tests/deployments-cache.json"));
  const deployments = JSON.parse(content.toString() || "[]");

  return contractNames.map(
    (ctName: string) =>
      deployments
        .filter((d: any) => d.networkId === networkId && d.name === ctName)
        .sort((a: any, b: any) => b.timestamp - a.timestamp)[0],
  );
}

async function getContractOptions(filePath: string) {
  const sourceCode = fs.readFileSync(filePath, "utf-8");
  const fileSystem = await getFileSystem(filePath);

  return { sourceCode, fileSystem };
}

async function createContract(sdk: AeSdk, contractPath: string, txOptions = {}) {
  return Contract.initialize({
    ...sdk.getContext(),
    ...(await getContractOptions(contractPath)),
    ...txOptions,
  });
}

async function createOrUseExistingContracts(aeSdk: AeSdk) {
  const output: any = {};
  const networkId = await aeSdk.api.getNetworkId();
  const bridgeTokenSource = "contracts/source/BridgeToken.aes";
  const hyperchainBridgeSource = "contracts/source/HyperchainBridge.aes";

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
