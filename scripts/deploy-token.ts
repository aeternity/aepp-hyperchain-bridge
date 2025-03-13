import { writeFileSync, readFileSync } from "fs";
import { createSdkInstance } from "@/utils/ae-sdk";
import { parseArguments, deployContract, parseNumberValue } from "./helper";

// Usage: bun deploy:token --network ae_uat --name TestToken1 --symbol TT1 --decimals 18 --balance 10000 --saveAci

const {
  parsed: { network },
  values,
} = parseArguments();

const name = values.name;
const symbol = values.symbol;
const decimals = parseNumberValue("decimals", values.decimals);
const balance = parseNumberValue("balance", values.balance);
const initialOwnerBalance = balance * 10 ** decimals;

const aeSdk = await createSdkInstance(network);
const tokenContract = await deployContract(aeSdk, "contracts/source/BridgeToken.aes");
await tokenContract.init(name, decimals, symbol, initialOwnerBalance);

console.log(`Token contract deployed at ${tokenContract.$options.address}`);

if (values.saveAci) {
  writeFileSync("contracts/aci/BridgeToken.json", JSON.stringify(tokenContract._aci, null, 0));
}
