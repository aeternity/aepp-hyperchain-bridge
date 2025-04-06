import { Network } from "@/types/network";

export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const AE_TESTNET: Network = {
  id: "ae_uat",
  name: "Testnet",
  url: "https://testnet.aeternity.io",
  mdwUrl: "https://testnet.aeternity.io/mdw",
  explorerUrl: "https://testnet.aescan.io",
  bridgeContractAddress: "ct_CQxcMLXXKg1Nsju7CmGfb5LsA24qrX7CMR69pKocBS9xCfGco",
  ...networkDefaults,
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io",
  mdwUrl: "https://mainnet.aeternity.io/mdw",
  explorerUrl: "https://aescan.io",
  bridgeContractAddress: "ct_9W134XDN1B8kAbRqQhvN3i2NJrei7toyM5MqeUEnMwuXwTkpM",
  ...networkDefaults,
};

export const HC_DEV: Network = {
  id: "hc_devnet",
  name: "HC Devnet Local",
  url: "http://localhost:23013",
  mdwUrl: "http://localhost:24000",
  explorerUrl: "http://localhost:28020",
  bridgeContractAddress:
    "ct_2fi1rcyFZdbkXsqFBxD2CS8NBDDaLWUzMyhZruYn9RKm2pRPaV",
  ...networkDefaults,
};

export const NETWORKS = [AE_MAINNET, AE_TESTNET, HC_DEV];
