import BigNumber from "bignumber.js";
import { type ContractMethodsBase } from "@aeternity/aepp-sdk";
import ContractWithMethods from "@aeternity/aepp-sdk/es/contract/Contract";

export type GenericContract = ContractWithMethods<ContractMethodsBase>;

// TODO: Extend these type with more specific contract methods
export type BridgeContract = GenericContract;
export type TokenContract = GenericContract;

export interface Network {
  id: string;
  url: string;
  name: string;
  compilerUrl: string;
}

export interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance?: BigNumber;
}
