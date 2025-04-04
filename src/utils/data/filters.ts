import { ALL_NETWORKS } from "@/constants/networks";
import { mapNetworkToBase } from "./mappers";

export const getNetworkById = (id: string) =>
  ALL_NETWORKS.find((network) => network.id === id);

export const getNetworkBaseById = (id: string) =>
  mapNetworkToBase(getNetworkById(id)!);

export const byAddress = (address: string) => (o: any) => o.address === address;
