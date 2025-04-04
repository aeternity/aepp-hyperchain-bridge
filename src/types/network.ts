export interface NetworkBase {
  id: string;
  url: string;
  name: string;
}

export interface Network extends NetworkBase {
  mdwUrl: string;
  compilerUrl: string;
  explorerUrl: string;
  bridgeContractAddress: string;
}
