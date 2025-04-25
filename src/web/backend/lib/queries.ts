import { Network } from "@/types/network";
import { supabase } from "./supabase";
import { BridgeAction } from "@/types/bridge";

export const queryNetworks = async (): Promise<Network[] | null> => {
  const { data } = await supabase.from("networks").select("*");
  return data;
};

export const queryLastAction = async (
  networkId: string
): Promise<BridgeAction | null> => {
  const { data } = await supabase
    .from("actions")
    .select("*")
    .eq("sourceNetworkId", networkId)
    .order("entryIdx", { ascending: false })
    .limit(1)
    .single();

  return data;
};
