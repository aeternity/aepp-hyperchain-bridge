import { resolve } from "path";
import { writeFileSync } from "fs";

import { createSdkInstance } from "@aepp-hyperchain-bridge/shared";
import {
  parseArguments,
  deployContract,
  parseNumberValue,
} from "../utils/scripts-helper";
import { ACI_FOLDER_PATH } from "..";

// Usage: bun deploy:token --network ae_uat --name TestToken --symbol TST --decimals 9 --balance 10000000 --saveAci

const {
  parsed: { network },
  values,
} = parseArguments();

const sourcePath = resolve(__dirname, "../source/FungibleToken.aes");
const aciPath = `${ACI_FOLDER_PATH}/FungibleToken.json`;

const name = values.name;
const symbol = values.symbol;
const decimals = parseNumberValue("decimals", values.decimals);
const balance = parseNumberValue("balance", values.balance);
const initialOwnerBalance = balance * 10 ** decimals;

const aeSdk = await createSdkInstance(network);
const tokenContract = await deployContract(aeSdk, sourcePath);
await tokenContract.init(name, decimals, symbol, initialOwnerBalance);

console.log(`Token contract deployed at ${tokenContract.$options.address}`);

if (values.saveAci) {
  writeFileSync(aciPath, JSON.stringify(tokenContract._aci, null, 0));
}
