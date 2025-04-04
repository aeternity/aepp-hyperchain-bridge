import { writeFileSync } from "node:fs";

import { createSdkInstance } from "@/utils/aeternity/create-sdk-node";
import {
  ACI_FOLDER_PATH,
  BRIDGE_SOURCE_PATH,
} from "@/constants/artifact-paths";
import { parseArguments, deployContract } from "@/utils/script/scripts-helper";

// Usage: bun deploy:bridge --network hc_devnet --saveAci

const {
  parsed: { network },
  values: { saveAci },
} = parseArguments();

const aciPath = `${ACI_FOLDER_PATH}/HyperchainBridge.json`;

const aeSdk = await createSdkInstance(network);
const bridgeContract = await deployContract(aeSdk, BRIDGE_SOURCE_PATH);
await bridgeContract.init();

console.log(`Bridge contract deployed at ${bridgeContract.$options.address}`);

if (saveAci) {
  writeFileSync(aciPath, JSON.stringify(bridgeContract._aci, null, 0));
}
