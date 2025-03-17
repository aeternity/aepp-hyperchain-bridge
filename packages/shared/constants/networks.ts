import type { Network } from "../lib/types";

export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io/",
  ...networkDefaults,
};

export const AE_TESTNET: Network = {
  id: "ae_uat",
  name: "Testnet",
  url: "https://testnet.aeternity.io/",
  ...networkDefaults,
};

export const HC_PERF: Network = {
  id: "aehc_perf",
  name: "HC Perf",
  url: "https://perf.hyperchains.aeternity.io/",
  ...networkDefaults,
};

export const ALL_NETWORKS = [AE_MAINNET, AE_TESTNET, HC_PERF];
