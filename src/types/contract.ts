import { ContractMethodsBase } from "@aeternity/aepp-sdk";
import ContractWithMethods from "@aeternity/aepp-sdk/es/contract/Contract";

export type GenericContract = ContractWithMethods<ContractMethodsBase>;

export enum BridgeContractStatus {
  LOADING,
  NOT_AVAILABLE,
  READY,
}
