import { resolve } from "node:path";

export const BRIDGE_SOURCE_PATH = resolve(
  __dirname,
  "../contracts/HyperchainBridge.aes"
);
export const TOKEN_SOURCE_PATH = resolve(
  __dirname,
  "../contracts/FungibleToken.aes"
);
export const DEPLOYMENTS_CACHE_PATH = resolve(
  __dirname,
  "../tests/deployments-cache.json"
);

export const ACI_FOLDER_PATH = resolve(__dirname, "../aci");
