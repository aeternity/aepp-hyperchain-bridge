import { TokenMeta } from "./token";

export interface NetworkBase {
  id: string;
  url: string;
  name: string;
}

export interface Network extends NetworkBase {
  mdwUrl: string;
  mdwWebSocketUrl: string;
  explorerUrl: string;
  bridgeContractAddress: string;
}

export interface NetworkWithCurrency extends Network {
  currency: TokenMeta;
  statusSucceeded: boolean;
}
