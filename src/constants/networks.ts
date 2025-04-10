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
  bridgeContractAddress: "ct_Sez5oVtCgNrgyMRsEfARajfNFsxtXoNoR1Nd7YzRwDCx5xxYs",
  ...networkDefaults,
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io",
  mdwUrl: "https://mainnet.aeternity.io/mdw",
  explorerUrl: "https://aescan.io",
  bridgeContractAddress: "ct_HF6vxGCvfUir1CpkcNMZmoFGiwDC5uvAfN9tKsrDDrLdswe3P",
  ...networkDefaults,
};

export const HC_DEV: Network = {
  id: "hc_devnet",
  name: "HC Devnet Local",
  url: "http://localhost:23013",
  mdwUrl: "http://localhost:24000",
  explorerUrl: "http://localhost:28020",
  bridgeContractAddress: "ct_iPPPd7TiEpY1FhvWVfMK2zC5cWRVuddj9mdWQMG3USsd4p7Ws",
  ...networkDefaults,
};

export const DEFAULT_NETWORKS = [AE_MAINNET, AE_TESTNET, HC_DEV];
