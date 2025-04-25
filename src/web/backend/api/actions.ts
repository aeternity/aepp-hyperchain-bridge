import { supabase } from "../lib/supabase";
import { syncAction } from "../lib/sync";

export const getByUserAddress = {
  async GET(
    req: Bun.BunRequest<"/api/actions/:userAddress">
  ): Promise<Response> {
    const { userAddress } = req.params;

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("userAddress", userAddress)
      .order("isCompleted", { ascending: true })
      .order("entryTimestamp", { ascending: false });

    if (error) {
      return Response.json({ ok: false, error });
    }

    return Response.json({ ok: true, data: data || [] });
  },
};

export const getByNetworkIdAndEntryIdx = {
  async GET(
    req: Bun.BunRequest<"/api/action/:sourceNetworkId/:entryIdx">
  ): Promise<Response> {
    const { sourceNetworkId, entryIdx } = req.params;

    const { data, error } = await supabase
      .from("actions")
      .select("*")
      .eq("sourceNetworkId", sourceNetworkId)
      .eq("entryIdx", Number(entryIdx));

    if (error) {
      return Response.json({ ok: false, error });
    }

    return Response.json({ ok: true, data: data[0] });
  },
};

export const syncTransaction = {
  async GET(
    req: Bun.BunRequest<"/api/actions/sync/:networkId/:hash">
  ): Promise<Response> {
    const { networkId, hash } = req.params;

    const action = await syncAction(hash, networkId);

    if (!action) {
      return Response.json({ ok: false, error: "Action not found" });
    }

    return Response.json({ ok: true, data: action });
  },
};
