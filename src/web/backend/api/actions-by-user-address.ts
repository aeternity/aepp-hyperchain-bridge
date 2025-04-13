import { supabase } from "../lib/supabase";

export default {
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
      return new Response(JSON.stringify({ ok: false, error }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true, data: data || [] }));
  },
};
