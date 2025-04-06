import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

export const supabase = createClient<Database>(
  Bun.env.SUPABASE_URL!,
  Bun.env.SUPABASE_ANON_KEY!
);
