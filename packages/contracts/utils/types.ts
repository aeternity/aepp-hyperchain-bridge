import { Network } from "@aepp-hyperchain-bridge/shared";
import { AeSdk, Contract, ContractMethodsBase } from "@aeternity/aepp-sdk";

// Contract Types
export interface TokenMeta {
  name: string;
  decimals: number;
  symbol: string;
}

export interface NetworkProps {
  id: string;
  name: string;
  url: string;
}

export const TokenType = {
  Native: (v) => ({
    Native: v,
  }),
  Link: (v) => ({
    Link: v,
  }),
  Standard: (v) => ({
    Standard: v,
  }),
};
type TokenType = ReturnType<(typeof TokenType)[keyof typeof TokenType]>;
export const tokenTypeToStr = (t: TokenType): keyof typeof TokenType => {
  if ("Native" in t) return "Native";
  if ("Standard" in t) return "Standard";
  if ("Link" in t) return "Link";
};

export interface BridgeEntry {
  idx: number;
  from: string;
  token?: string;
  amount: number;
  token_type: TokenType;
  exit_link?: TokenLink;
  target_network: NetworkProps;
}

export interface ExitRequest {
  entry: BridgeEntry;
  entry_tx_hash: string;
  entry_network: NetworkProps;
  entry_token_meta: TokenMeta;
}

export interface TokenLink {
  local_token: string;
  is_source_native: boolean;
  source_token?: string;
  source_network: NetworkProps;
}
// End Contract Types

export interface BridgeEntryTx {
  deposit: BridgeEntry;
  tx_hash: string;
}

export interface Bridge {
  sdk: AeSdk;
  token: Contract<ContractMethodsBase>;
  tokenMeta: {
    name: string;
    decimals: number;
    symbol: string;
  };
  network: Network;
  contract: Contract<ContractMethodsBase>;
}
