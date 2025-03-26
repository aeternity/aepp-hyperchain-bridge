import { Network } from "@aepp-hyperchain-bridge/shared";
import { AeSdk, Contract, ContractMethodsBase } from "@aeternity/aepp-sdk";

// Contract Types
export interface TokenMeta {
  id?: string;
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
  Child: (v) => ({
    Child: v,
  }),
  Standard: (v) => ({
    Standard: v,
  }),
};
type TokenType = ReturnType<(typeof TokenType)[keyof typeof TokenType]>;
export const tokenTypeToStr = (t: TokenType): keyof typeof TokenType => {
  if ("Native" in t) return "Native";
  if ("Standard" in t) return "Standard";
  if ("Child" in t) return "Child";
};

export interface Deposit {
  idx: number;
  amount: number;
  from: string;
  token?: string;
  token_type: TokenType;
  for_network: NetworkProps;
  original_token?: ChildToken;
}

export interface Claim {
  deposit: Deposit;
  deposit_tx_hash: string;
  deposit_network: NetworkProps;
  deposit_token_meta: TokenMeta;
}

export interface ChildToken {
  ct: string;
  is_native: boolean;
  original_token?: string;
  origin_network: NetworkProps;
}
// End Contract Types

export interface DepositTx {
  deposit: Deposit;
  tx_hash: string;
}

export interface Bridge {
  sdk: AeSdk;
  token: Contract<ContractMethodsBase>;
  tokenMeta: {
    name: string;
    decimals: number;
    symbol: string;
    id: `ct_${string}`;
  };
  network: Network;
  contract: Contract<ContractMethodsBase>;
}
