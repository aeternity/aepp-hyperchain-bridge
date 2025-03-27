import { readFileSync, writeFileSync } from "fs";
import { AeSdk, Contract } from "@aeternity/aepp-sdk";
import getFileSystem from "./getFileSystem";
import {
  createSdkInstance,
  GenericContract,
  Network,
} from "@aepp-hyperchain-bridge/shared";
import {
  BRIDGE_SOURCE_PATH,
  DEPLOYMENTS_CACHE_PATH,
  TOKEN_SOURCE_PATH,
} from "..";
import { Bridge } from "./types";

export const getAccountAddress = (contract: GenericContract) =>
  contract.$options.address.replace("ct_", "ak_");

export async function setupContracts(
  networkA: Network,
  networkB: Network
): Promise<{ [key: string]: Bridge }> {
  const contractsA = await setupBridgeForNetwork("A", networkA);
  const contractsB = await setupBridgeForNetwork("B", networkB);

  return { ...contractsA, ...contractsB };
}

async function setupBridgeForNetwork(code: string, network: Network) {
  console.log(`Setting up bridge for network ${network.name} (${code})`);
  const deployments = JSON.parse(
    readFileSync(DEPLOYMENTS_CACHE_PATH).toString()
  );
  const cachedDeployment = deployments[network.id];

  const sdk = await createSdkInstance(network);
  const contract = cachedDeployment
    ? await Contract.initialize({
        ...sdk.getContext(),
        ...cachedDeployment.bridge,
      })
    : await createContract(sdk, BRIDGE_SOURCE_PATH);

  const initialSupply = 1e27;
  const tokenMeta = {
    name: `Hyperchain Bridge Test Token - ${code}`,
    decimals: 18,
    symbol: `HBT-${code}`,
  };
  const token = cachedDeployment
    ? await Contract.initialize({
        ...sdk.getContext(),
        ...cachedDeployment.token,
      })
    : await createContract(sdk, TOKEN_SOURCE_PATH, [
        tokenMeta.name,
        tokenMeta.decimals,
        tokenMeta.symbol,
        initialSupply,
      ]);

  if (!cachedDeployment) {
    await configureContractsForTesting(sdk, contract, token, initialSupply);
    deployments[network.id] = {
      bridge: {
        address: contract.$options.address,
        aci: contract._aci,
      },
      token: {
        address: token.$options.address,
        aci: token._aci,
      },
    };
    writeFileSync(DEPLOYMENTS_CACHE_PATH, JSON.stringify(deployments, null, 2));
  }

  sdk.selectAccount(sdk.addresses()[1]);

  return {
    [`BRIDGE_${code}`]: {
      sdk,
      token,
      network,
      contract,
      tokenMeta,
    },
  };
}

async function configureContractsForTesting(
  aeSdk: AeSdk,
  bridgeContract: GenericContract,
  tokenContract: GenericContract,
  initialSupply: number
) {
  const ownerAddress = aeSdk.addresses()[0] as `ak_${string}`;
  const userAddress = aeSdk.addresses()[1] as `ak_${string}`;

  // Transfer test tokens to user address
  const userShare = initialSupply / 2;
  aeSdk.selectAccount(ownerAddress);
  await tokenContract.transfer(userAddress, userShare);

  // Create allowance for bridge account
  aeSdk.selectAccount(userAddress);
  await tokenContract.create_allowance(
    getAccountAddress(bridgeContract),
    userShare
  );

  aeSdk.selectAccount(ownerAddress);
  await tokenContract.set_owner(getAccountAddress(bridgeContract));
}

async function getContractOptions(filePath: string) {
  const sourceCode = readFileSync(filePath, "utf-8");
  const fileSystem = await getFileSystem(filePath);

  return { sourceCode, fileSystem };
}

export async function createContract(
  sdk: AeSdk,
  contractPath: string,
  initArgs = []
) {
  const contract = await Contract.initialize({
    ...sdk.getContext(),
    ...(await getContractOptions(contractPath)),
  });

  await contract.init(...initArgs);
  return contract;
}
