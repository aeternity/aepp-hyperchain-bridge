import { ALL_NETWORKS } from "../constants/networks";
import { BRIDGE_CONTRACTS } from "../constants/contracts";

export const getNetworkById = (id: string) =>
  ALL_NETWORKS.find((network) => network.id === id);

export const byAddress = (address: string) => (o: any) => o.address === address;

export const getBridgeContractAddress = (
  networkId: string
): `ct_${string}` | undefined =>
  BRIDGE_CONTRACTS.find((a) => a.networkId === networkId)
    ?.address as `ct_${string}`;
