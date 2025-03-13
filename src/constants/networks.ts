export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const aeMain: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io/",

  ...networkDefaults,
};

export const aeTest: Network = {
  id: "ae_uat",
  name: "Testnet",
  url: "https://testnet.aeternity.io/",
  ...networkDefaults,
};

export const hcPerf: Network = {
  id: "aehc_perf",
  name: "HC Perf",
  url: "https://perf.hyperchains.aeternity.io/",
  ...networkDefaults,
};

export const networks = [aeMain, aeTest, hcPerf];
