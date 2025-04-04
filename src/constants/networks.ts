import { Network } from "@/types/network";

export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io",
  mdwUrl: "https://mainnet.aeternity.io/mdw",
  explorerUrl: "https://aescan.io",
  bridgeContractAddress: "ct_PjRdfrinoa7AXUJxa6ZWe8mpuBgZ9FvrDesRjebg6D3VkkadB",
  ...networkDefaults,
};

export const AE_TESTNET: Network = {
  id: "ae_uat",
  name: "Testnet",
  url: "https://testnet.aeternity.io",
  mdwUrl: "https://testnet.aeternity.io/mdw",
  explorerUrl: "https://testnet.aescan.io",
  bridgeContractAddress:
    "ct_283VrRF9KMLTDEp8zDTW2zjhaz5GRV2AEp4gwdaZwz17EVfUGB",
  ...networkDefaults,
};

// export const HC_DINCHO: Network = {
//   id: "aehc_dincho",
//   name: "HC Dincho",
//   url: "https://dincho.hyperchains.aeternity.io",
//   mdwUrl: "https://dincho.hyperchains.aeternity.io:8443",
//   explorerUrl: "https://aescan.dincho.hyperchains.aepps.com",
//   ...networkDefaults,
// };

// export const HC_PERF: Network = {
//   id: "aehc_perf",
//   name: "HC Perf",
//   url: "https://perf.hyperchains.aeternity.io",
//   mdwUrl: "https://perf.hyperchains.aeternity.io:8443",
//   explorerUrl: "https://aescan.perf.hyperchains.aepps.com",
//   ...networkDefaults,
// };

// export const HC_DEV: Network = {
//   id: "hc_devnet",
//   name: "HC Devnet Local",
//   url: "http://localhost:23013",
//   mdwUrl: "http://localhost:24000",
//   explorerUrl: "http://localhost:28020",
//   ...networkDefaults,
// };

export const ALL_NETWORKS = [AE_MAINNET, AE_TESTNET];
