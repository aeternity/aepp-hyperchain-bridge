type ContractWithMethods = import("@aeternity/aepp-sdk/es/contract/Contract").default;
type ContractMethodsBase = import("@aeternity/aepp-sdk/es/contract/Contract").ContractMethodsBase;

type GenericContract = ContractWithMethods<ContractMethodsBase>;
type Wallet = Parameters<Parameters<typeof walletDetector>[1]>[0]["newWallet"];

interface ContractDeployment {
  networkId: string;
  timestamp: number;
  aci: any;
  name: string;
  address: `ct_${string}`;
  bytecode: string;
}

interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
}

interface Network {
  id: string;
  url: string;
  name: string;
  compilerUrl: string;
}
