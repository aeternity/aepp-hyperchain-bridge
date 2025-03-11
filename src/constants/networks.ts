export interface Network {
  id: string;
  url: string;
  compilerUrl: string;
}

export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const aeMain: Network = {
  id: "ae_mainnet",
  url: "https://mainnet.aeternity.io/",
  ...networkDefaults,
};

export const aeTest: Network = {
  id: "ae_uat",
  url: "https://testnet.aeternity.io/",
  ...networkDefaults,
};

export const hcPerf: Network = {
  id: "aehc_perf",
  url: "https://perf.hyperchains.aeternity.io/",
  ...networkDefaults,
};
