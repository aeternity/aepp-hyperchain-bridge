import { supabase } from "../lib/supabase";

export const byUserAddress = {
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
      return new Response(JSON.stringify({ ok: false, error }));
    }

    return new Response(JSON.stringify({ ok: true, data: data || [] }));
  },
};

export const byNetworkIdAndEntryIdx = {
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
      return new Response(JSON.stringify({ ok: false, error }));
    }

    return new Response(JSON.stringify({ ok: true, data: data[0] }));
  },
};
