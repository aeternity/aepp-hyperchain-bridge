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
  bridgeContractAddress: "ct_mufStEZHSSMzueqEYb7jqrTvi7DLsRwHUDerx8Rs9hMDfMgka",
};

export const AE_MAINNET: Network = {
  id: "ae_mainnet",
  name: "Mainnet",
  url: "https://mainnet.aeternity.io",
  mdwUrl: "https://mainnet.aeternity.io/mdw",
  mdwWebSocketUrl: "wss://mainnet.aeternity.io/mdw/v3/websocket",
  explorerUrl: "https://aescan.io",
  bridgeContractAddress:
    "ct_2WuwEimsN5nYDUDPcdZKXyAy1U7rsgEhxtzioDQUsdCVrdffqJ",
};

export const HC_DEV: Network = {
  id: "hc_devnet",
  name: "HC Devnet Local",
  url: "http://localhost:23013",
  mdwUrl: "http://localhost:24000",
  mdwWebSocketUrl: "http://localhost:24001/v3/websocket",
  explorerUrl: "http://localhost:28020",
  bridgeContractAddress:
    "ct_2fi1rcyFZdbkXsqFBxD2CS8NBDDaLWUzMyhZruYn9RKm2pRPaV",
};

export const DEFAULT_NETWORKS = [AE_MAINNET];
