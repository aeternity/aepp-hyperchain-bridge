import { writeFileSync } from "node:fs";

import { createSdkInstance } from "@/utils/ae-sdk";
import { parseArguments, deployContract } from "./helper";

// Usage: bun deploy:bridge --network ae_uat --saveArtifacts

const {
  parsed: { network },
  values: { saveAci },
} = parseArguments();

const aeSdk = await createSdkInstance(network);
const bridgeContract = await deployContract(aeSdk, "contracts/source/HyperchainBridge.aes");
await bridgeContract.init();

console.log(`Bridge contract deployed at ${bridgeContract.$options.address}`);

if (saveAci) {
  writeFileSync(
    "contracts/aci/HyperchainBridge.json",
    JSON.stringify(bridgeContract._aci, null, 0),
  );
}
