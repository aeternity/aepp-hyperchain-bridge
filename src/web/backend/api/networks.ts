import { supabase } from "../lib/supabase";

export default {
  async GET(req: Bun.BunRequest): Promise<Response> {
    let { data } = await supabase.from("networks").select("*");
    return Response.json(data);
  },
};
