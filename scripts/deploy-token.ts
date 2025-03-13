import { getNetworkById } from "@/utils/filters";
import { createSdkInstance } from "@/utils/ae-sdk";
import { parseArguments, deployContract } from "./helper";

// Usage: bun deploy:token --network ae_uat --name TestToken --symbol TST --decimals 18 --initialOwnerBalance 1000000

const args = parseArguments();

if (!args.network || !args.name || !args.symbol || !args.decimals || !args.initialOwnerBalance) {
  console.log(`Network, name, symbol, decimals, and initialOwnerBalance arguments are required`);
  process.exit(1);
}

const name = args.name;
const symbol = args.symbol;
const decimals = parseInt(args.decimals);
const network = getNetworkById(args.network);
const initialOwnerBalance = parseInt(args.initialOwnerBalance) * 10 ** decimals;

if (!network) {
  console.log(`Network not found`);
  process.exit(1);
}

const aeSdk = await createSdkInstance(network);
const bridgeContract = await deployContract(aeSdk, "contracts/source/BridgeToken.aes");

await bridgeContract.init(name, decimals, symbol, initialOwnerBalance);

console.log(`Token contract deployed at ${bridgeContract.$options.address}`);
console.log(`Token contract bytecode: ${bridgeContract.$options.bytecode}`);
console.log(`Token contract ACI: ${JSON.stringify(bridgeContract._aci)}`);
