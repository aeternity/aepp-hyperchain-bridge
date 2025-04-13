import { DEFAULT_NETWORKS } from "@/constants/networks";
import { mapNetworkToBase } from "./mappers";

export const byId = (id: string) => (o: any) => o.id === id;
export const notById = (id: string) => (o: any) => o.id !== id;

export const getDefaultNetworkById = (id: string) =>
  DEFAULT_NETWORKS.find(byId(id));

export const byAddress = (address: string) => (o: any) => o.address === address;
