import assert from "node:assert";

import { parseArguments } from "./helper";
import { createSdkInstance, getContract } from "@/utils/ae-sdk";
import HyperchainBridge_aci from "../contracts/aci/HyperchainBridge.json";

// Usage: bun configure:bridge --network ae_uat --address ct_ea8D2DbzfWVBjTkxDoXYFZR3wAUQMc9ji743LRWmZBAx33Yow --tokensToRegister ct_2c7JasaDqYKYXCXHmD7YnokYbUNwMyNenTJVuZU76wChRLQdJA ct_jcbziWjsTb9CEkBub6n8d12ZaTtjg49a2mdawPc6H9gBT8FVg ct_2THHu4bzSmZELX6nhoRuV3yhuHja3FEr7owPZt7KPiHU7RFyJY --networksToRegister aehc_perf ae_mainnet

const {
  parsed: { network },
  values: { address, tokensToRegister, networksToRegister },
} = parseArguments();

const aeSdk = await createSdkInstance(network);
const bridgeContract = await getContract(aeSdk, address as `ct_${string}`, HyperchainBridge_aci);

const registeredNetworks = (await bridgeContract.registered_networks()).decodedResult;
const registeredTokens = (await bridgeContract.registered_tokens()).decodedResult;

for (const id of networksToRegister!) {
  if (registeredNetworks.includes(id)) {
    console.log(`Network ${id} is already registered`);
    continue;
  }
  await bridgeContract.register_network(id);
}

for (const token of tokensToRegister!) {
  if (registeredTokens.includes(token)) {
    console.log(`Token ${token} is already registered`);
    continue;
  }
  await bridgeContract.register_token(token);
}

assert.deepEqual((await bridgeContract.registered_tokens()).decodedResult, tokensToRegister);
assert.deepEqual((await bridgeContract.registered_networks()).decodedResult, networksToRegister);

console.log(`Bridge contract configured at ${bridgeContract.$options.address}`);
