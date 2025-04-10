import { AeSdk, type ContractMethodsBase, Contract } from "@aeternity/aepp-sdk";

import { Network, NetworkBase } from "./network";
import { FungibleTokenContract, TokenMeta } from "./token";

export type HyperchainBridgeContract = Contract<HyperchainBridge>;

export interface HyperchainBridge extends ContractMethodsBase {
  operator: () => Promise<string>;
  token_links: () => Promise<TokenLink[]>;
  bridge_entries: () => Promise<BridgeEntry[]>;
  bridge_entry: (idx: number | bigint) => Promise<BridgeEntry | null>;
  processed_exits: () => Promise<ExitRequest[]>;
  check_ids_processed: (
    ids: Array<number | bigint>,
    source_network_id: string
  ) => Promise<Array<[number, boolean]>>;

  enter_bridge: (
    amount: number | bigint,
    target_network: NetworkBase,
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
  target_network: NetworkBase;
  source_network_id: string;
}

export interface BridgeEntryTx extends BridgeEntry {
  hash: string;
  timestamp: number;
  is_action_completed?: boolean;
}

export interface ExitRequest {
  entry: BridgeEntry;
  entry_tx_hash: string;
  entry_network: NetworkBase;
  entry_token_meta: TokenMeta;
}

export interface TokenLink {
  local_token: string;
  is_source_native: boolean;
  source_token?: string;
  source_network: NetworkBase;
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
