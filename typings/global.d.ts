type BigNumber = import("bignumber.js").default;

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
  balance?: BigNumber;
}

interface Network {
  id: string;
  url: string;
  name: string;
  compilerUrl: string;
}

interface TokenBalance {
  address: string;
  balance: BigNumber;
}
