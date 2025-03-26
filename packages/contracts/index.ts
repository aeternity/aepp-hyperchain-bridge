import { resolve } from "path";

export const BRIDGE_SOURCE_PATH = resolve(
  __dirname,
  "./source/HyperchainBridge.aes"
);
export const TOKEN_SOURCE_PATH = resolve(
  __dirname,
  "./source/FungibleToken.aes"
);
export const DEPLOYMENTS_CACHE_PATH = resolve(
  __dirname,
  "./deployments-cache.json"
);

export const ACI_FOLDER_PATH = resolve(__dirname, "../shared/aci");
