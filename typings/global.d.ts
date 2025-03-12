type Wallet = Parameters<Parameters<typeof walletDetector>[1]>[0]["newWallet"];

interface ContractDeployment {
  networkId: string;
  timestamp: number;
  aci: any;
  name: string;
  address: string;
  bytecode: string;
}
