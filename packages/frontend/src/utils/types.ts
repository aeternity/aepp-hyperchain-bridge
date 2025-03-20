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

export interface Transaction {
  hash: string;
  tx: {
    arguments: Array<{ type: string; value: string }>;
    caller_id: string;
    result: "ok" | "error";
    return: {
      type: string;
      value: number;
    };
  };
  micro_time: number;
}
export interface TransactionsResult {
  data: Transaction[];
  next: string | null;
  prev: string | null;
}

export interface Deposit {
  idx: number;
  amount: BigNumber;
  tokenAddress: string;
  destinationNetworkId: string;
  txHash: string;
  fromNetworkId: string;
  timestamp: number;
}
