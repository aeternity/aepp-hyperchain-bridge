import { networks } from "@/constants/networks";
import { bridgeAddresses } from "@/constants/addresses";

export const getNetworkById = (id: string) => networks.find((network) => network.id === id);

export const byAddress = (address: string) => (o: any) => o.address === address;

export const getBridgeContractAddress = (networkId: string): `ct_${string}` | undefined =>
  bridgeAddresses.find((a) => a.networkId === networkId)?.address as `ct_${string}`;
