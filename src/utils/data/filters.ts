import { NETWORKS } from "@/constants/networks";
import { mapNetworkToBase } from "./mappers";

export const byId = (id: string) => (o: any) => o.id === id;

export const getNetworkById = (id: string) => NETWORKS.find(byId(id));

export const getNetworkBaseById = (id: string) =>
  mapNetworkToBase(getNetworkById(id)!);

export const byAddress = (address: string) => (o: any) => o.address === address;
