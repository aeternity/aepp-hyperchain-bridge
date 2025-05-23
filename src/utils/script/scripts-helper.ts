import fs from "fs";
import { parseArgs } from "util";
import { AeSdk, Contract, getFileSystem } from "@aeternity/aepp-sdk";

import { getDefaultNetworkById } from "@/utils/data/filters";
import { BRIDGE_SOURCE_PATH } from "@/constants/artifact-paths";

export function parseArguments() {
  let { values } = parseArgs({
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
      balance: {
        type: "string",
      },
      address: {
        type: "string",
      },
      tokensToRegister: {
        type: "string",
        multiple: true,
      },
      networksToRegister: {
        type: "string",
        multiple: true,
      },
      saveAci: {
        type: "boolean",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  const network = parseNetwork(values.network);
  const networksToRegister = paseNetworks(values.networksToRegister);

  return {
    values,
    parsed: { network, networksToRegister },
  };
}

export const parseNumberValue = (key: string, value: string | undefined) => {
  const parsed = parseInt(value!);
  if (isNaN(parsed)) {
    console.log(`${key} should be a number`);
    process.exit(1);
  }
  return parsed;
};

const paseNetworks = (networks: string[] | undefined) => {
  if (!networks) return [];
  return networks.map(parseNetwork);
};

const parseNetwork = (networkId: string | undefined) => {
  const network = getDefaultNetworkById(networkId!);
  if (!network) {
    console.log(`Network not found`);
    process.exit(1);
  }
  return network;
};

export async function deployContract(aeSdk: AeSdk, sourcePath: string) {
  const sourceCode = fs.readFileSync(sourcePath, "utf-8");
  const fileSystem = await getFileSystem(sourcePath);

  return await Contract.initialize({
    ...aeSdk.getContext(),
    sourceCode,
    fileSystem,
  });
}

export async function deployBridgeContract(aeSdk: AeSdk) {
  return deployContract(aeSdk, BRIDGE_SOURCE_PATH);
}
