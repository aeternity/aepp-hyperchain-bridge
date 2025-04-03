import { Contract, type ContractMethodsBase } from "@aeternity/aepp-sdk";
import BigNumber from "bignumber.js";

export type FungibleTokenContract = Contract<FungibleToken>;

export interface FungibleToken extends ContractMethodsBase {
  meta_info: () => Promise<TokenMeta>;
  balance: (account: string) => Promise<bigint | undefined>;
}

export interface TokenMeta {
  name: string;
  symbol: string;
  decimals: bigint;
}

export interface Token extends TokenMeta {
  address: string;
}

export interface TokenAmount extends Token {
  amount: BigNumber;
}
