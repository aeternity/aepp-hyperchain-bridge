import { resolve } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";

import { getFileSystem, Contract, AeSdk } from "@aeternity/aepp-sdk";
import {
  type GenericContract,
  HyperchainBridge_aci,
  BridgeToken_aci,
} from "@aepp-hyperchain-bridge/shared";

export const BRIDGE_SOURCE_PATH = resolve(
  __dirname,
  "./source/HyperchainBridge.aes"
);
export const TOKEN_SOURCE_PATH = resolve(__dirname, "./source/BridgeToken.aes");
export const DEPLOYMENTS_CACHE_PATH = resolve(
  __dirname,
  "./deployments-cache.json"
);

export const ACI_FOLDER_PATH = resolve(__dirname, "../shared/aci");

export async function setupContracts(aeSdk: AeSdk) {
  // Account addresses
  const ownerAddress = aeSdk.addresses()[0] as `ak_${string}`;
  const userAddress = aeSdk.addresses()[1] as `ak_${string}`;

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
    aeSdk
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
  aeSdk: AeSdk
) {
  // Register testnet network
  aeSdk.selectAccount(ownerAddress as `ak_${string}`);
  const { decodedResult: registeredNetworks } =
    await Bridge.registered_networks();
  if (!registeredNetworks.includes("aehc_perf")) {
    await Bridge.register_network("aehc_perf");
  }

  // Register test token
  const { decodedResult: registeredTokens } = await Bridge.registered_tokens();
  if (!registeredTokens.includes(testTokenAddress)) {
    await Bridge.register_token(testTokenAddress);
  }

  // Transfer test tokens to user
  const { decodedResult: userTestTokenBalance } = await TestToken.balance(
    userAddress
  );
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

function getDeploymentsCache() {
  const content = existsSync(DEPLOYMENTS_CACHE_PATH)
    ? readFileSync(DEPLOYMENTS_CACHE_PATH)
    : "";

  return JSON.parse(content.toString() || "[]");
}

function saveDeployments(networkId: string, contracts: GenericContract[]) {
  const deployments = getDeploymentsCache();
  const timestamp = Date.now();

  contracts.forEach((contract) => {
    deployments.push({
      networkId,
      address: contract.$options.address,
      timestamp,
      name: contract._name,
      aci: contract._aci,
    });
  });

  writeFileSync(DEPLOYMENTS_CACHE_PATH, JSON.stringify(deployments, null, 2));
}

function loadDeployments(networkId: string, contractNames: string[]) {
  const deployments = getDeploymentsCache();

  return contractNames.map(
    (ctName: string) =>
      deployments
        .filter((d: any) => d.networkId === networkId && d.name === ctName)
        .sort((a: any, b: any) => b.timestamp - a.timestamp)[0]
  );
}

async function getContractOptions(filePath: string) {
  const sourceCode = readFileSync(filePath, "utf-8");
  const fileSystem = await getFileSystem(filePath);

  return { sourceCode, fileSystem };
}

async function createContract(
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

async function createOrUseExistingContracts(aeSdk: AeSdk) {
  const output: any = {};
  const networkId = await aeSdk.api.getNetworkId();

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
    output.Bridge = await createContract(aeSdk, BRIDGE_SOURCE_PATH);
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
    output.TestToken = await createContract(aeSdk, TOKEN_SOURCE_PATH);
    await output.TestToken.init("TestToken", 18, "TST", 1e27);
    await saveDeployments(networkId, [output.TestToken]);
  }

  return output;
}

export { HyperchainBridge_aci, BridgeToken_aci };
