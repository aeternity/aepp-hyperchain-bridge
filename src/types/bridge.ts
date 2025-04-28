import { AeSdk, type ContractMethodsBase, Contract } from "@aeternity/aepp-sdk";

import { Network } from "./network";
import { FungibleTokenContract, TokenMeta } from "./token";
import { Tables } from "@/web/backend/lib/database.types";

export type HyperchainBridgeContract = Contract<HyperchainBridge>;

export interface HyperchainBridge extends ContractMethodsBase {
  operator: () => Promise<string>;
  _token_links: () => Promise<TokenLink[]>;
  _bridge_entries: () => Promise<BridgeEntry[]>;
  _processed_exits: () => Promise<ExitRequest[]>;
  bridge_entry: (idx: number | bigint) => Promise<BridgeEntry | null>;
  check_ids_processed: (
    ids: Array<number | bigint>,
    source_network_id: string
  ) => Promise<Array<[number, boolean]>>;

  enter_bridge: (
    amount: number | bigint,
    target_network_id: string,
    token?: string,
    options?: {
      amount?: number | bigint;
      ttl?: number;
    }
  ) => Promise<BridgeEntry>;

  exit_bridge: (
    request: ExitRequest,
    timestamp: number,
    signature: string,
    options?: {
      ttl?: number;
    }
  ) => Promise<TokenLink>;

  stringify_exit_request: (
    request: ExitRequest,
    timestamp: number
  ) => Promise<string>;
}

export interface BridgeEntry {
  idx: bigint;
  from: string;
  token?: string;
  amount: bigint;
  token_type: TokenType;
  exit_link?: TokenLink;
  source_network_id: string;
  target_network_id: string;
}

export interface BridgeEntryTx extends BridgeEntry {
  hash: string;
  timestamp: number;
  is_action_completed?: boolean;
}

export interface BridgeExitTx {
  hash: string;
  timestamp: number;
  exitRequest: ExitRequest;
  ok: boolean;
}

export type BridgeAction = Tables<"actions">;

export interface ExitRequest {
  entry: BridgeEntry;
  entry_tx_hash: string;
  entry_token_meta: TokenMeta;
}

export interface TokenLink {
  local_token: string;
  is_source_native: boolean;
  source_token?: string;
  source_network_id: string;
}

export interface BridgeTestSetup {
  sdk: AeSdk;
  token: FungibleTokenContract;
  tokenMeta: TokenMeta;
  network: Network;
  contract: HyperchainBridgeContract;
}

export const TokenType = {
  get Native() {
    return { Native: [] };
  },
  get Link() {
    return { Link: [] };
  },
  get Standard() {
    return { Standard: [] };
  },
};
type TokenType = (typeof TokenType)[keyof typeof TokenType];
export const tokenTypeToStr = (t: TokenType) => {
  if ("Native" in t) return "Native";
  if ("Standard" in t) return "Standard";
  if ("Link" in t) return "Link";
};
