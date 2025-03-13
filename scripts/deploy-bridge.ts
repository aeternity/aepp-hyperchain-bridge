import { getNetworkById } from "@/utils/filters";
import { createSdkInstance } from "@/utils/ae-sdk";
import { parseArguments, deployContract } from "./helper";

// Usage: bun deploy:bridge --network ae_uat

const args = parseArguments();

if (!args.network) {
  console.log(`Network not provided`);
  process.exit(1);
}

const network = getNetworkById(args.network);

if (!network) {
  console.log(`Network not found`);
  process.exit(1);
}

const aeSdk = await createSdkInstance(network);
const bridgeContract = await deployContract(aeSdk, "contracts/source/HyperchainBridge.aes");

await bridgeContract.init();

console.log(`Bridge contract deployed at ${bridgeContract.$options.address}`);
console.log(`Bridge contract bytecode: ${bridgeContract.$options.bytecode}`);
console.log(`Bridge contract ACI: ${JSON.stringify(bridgeContract._aci)}`);
