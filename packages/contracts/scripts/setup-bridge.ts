import assert from "node:assert";

import { parseArguments } from "./helper";
import {
  createSdkInstance,
  getContract,
  HyperchainBridge_aci,
} from "@aepp-hyperchain-bridge/shared";

// Usage: bun setup:bridge --network aehc_perf --address ct_Yaiok5GciaDZqzoMUfnarNbdpC7zE8fMKSfSjCiYEkXEaScYJ --tokensToRegister ct_PbQLmgjPJDoH3eCKRXpDzpuSddc8jBeB1RJXBSwTw3PVd7zSJ --tokensToRegister ct_2uALHMBJKQcr6LkDwEiHawViyjnV2vK93SGNkuctRXfyY9j7QW --tokensToRegister ct_S9fLDmc8GRKFhXj4gAHvQ6ttMYxCYfEc4JC5JnLpxhTkL5kpr --networksToRegister aehc_perf --networksToRegister ae_mainnet

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
