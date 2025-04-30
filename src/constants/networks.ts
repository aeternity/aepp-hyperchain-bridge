import { Network } from "@/types/network";

export const networkDefaults = {
  compilerUrl: "https://v8.compiler.aepps.com",
};

export const AE_TESTNET: Network = {
  id: "ae_uat",
  name: "Testnet",
  url: "https://testnet.aeternity.io",
  mdwUrl: "https://testnet.aeternity.io/mdw",
  mdwWebSocketUrl: "wss://testnet.aeternity.io/mdw/v3/websocket",
  explorerUrl: "https://testnet.aescan.io",
  bridgeContractAddress:
    "ct_23chXaWkvfVqTvKbA4EJmPRdZUzsMAiJpNf5KsRrcnxQeH1Gww",
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io",
  mdwUrl: "https://mainnet.aeternity.io/mdw",
  mdwWebSocketUrl: "wss://mainnet.aeternity.io/mdw/v3/websocket",
  explorerUrl: "https://aescan.io",
  bridgeContractAddress:
    "ct_2VQAQaofUL2qwcJs69kGD6aix6vmyaEuqVzbtXKBLY2FFShdsp",
};

export const DEFAULT_NETWORKS = [AE_MAINNET, AE_TESTNET];
