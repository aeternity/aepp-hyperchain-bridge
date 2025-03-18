import { walletDetector } from "@aeternity/aepp-sdk";
import BigNumber from "bignumber.js";

export type Wallet = Parameters<
  Parameters<typeof walletDetector>[1]
>[0]["newWallet"];

export enum DetectionStatus {
  IDLE = "idle",
  DETECTING = "detecting",
  DETECTED = "detected",
  FAILED = "failed",
}

export enum ConnectionStatus {
  IDLE = "idle",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  FAILED = "failed",
}

export enum BridgeContractStatus {
  LOADING = "loading",
  NOT_AVAILABLE = "not_available",
  AVAILABLE = "available",
}

export interface TokenBalance {
  address: string;
  balance: BigNumber;
}
