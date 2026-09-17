import { Network } from "@/types/network";
import { BridgeAction } from "@/types/bridge";
import { getNetworks, getLastAction } from "./db";

export const queryNetworks = async (): Promise<Network[] | null> => {
  return getNetworks();
};

export const queryLastAction = async (
  networkId: string
): Promise<BridgeAction | null> => {
  return getLastAction(networkId);
};
