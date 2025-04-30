import { DEFAULT_NETWORKS } from "@/constants/networks";
import { queryNetworks } from "./queries";

export async function getAllNetworks() {
  const dbNetworks = await queryNetworks();
  return DEFAULT_NETWORKS.concat(dbNetworks || []);
}
