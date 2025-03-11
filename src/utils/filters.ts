import { networks } from "@/constants/networks";

export const getNetworkById = (id: string) => networks.find((network) => network.id === id);
