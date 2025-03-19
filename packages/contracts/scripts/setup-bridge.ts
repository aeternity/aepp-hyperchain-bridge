import assert from "node:assert";

import { parseArguments } from "./helper";
import {
  createSdkInstance,
  getContract,
  HyperchainBridge_aci,
} from "@aepp-hyperchain-bridge/shared";

// Usage: bun setup:bridge --network hc_devnet --address ct_29HcZriT4qxxR8WeFiiqDVjDG7riHpjh6WXupgbWLLPPvJ3Thh --tokensToRegister ct_gBJsmAigCfk2FGjwaxijNZy8bh59ZMt1SdtXzPaCNixZwb5rp --tokensToRegister ct_25xJ1jdD8X2S7gUUGZV347TaitkXSVFV1q2pLZ4wU3hFWxGsRw --networksToRegister ae_uat --networksToRegister ae_mainnet

const {
  parsed: { network },
  values: { address, tokensToRegister, networksToRegister },
} = parseArguments();

const aeSdk = await createSdkInstance(network);
const bridgeContract = await getContract(
  aeSdk,
  address as `ct_${string}`,
  HyperchainBridge_aci
);

const registeredNetworks = (await bridgeContract.registered_networks())
  .decodedResult;
const registeredTokens = (await bridgeContract.registered_tokens())
  .decodedResult;

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

assert.deepEqual(
  (await bridgeContract.registered_tokens()).decodedResult,
  tokensToRegister
);
assert.deepEqual(
  (await bridgeContract.registered_networks()).decodedResult,
  networksToRegister
);

console.log(`Bridge contract configured at ${bridgeContract.$options.address}`);
