import { createClient } from "@supabase/supabase-js";

/**
 * Architecture note:
 * - This project uses the Next.js App Router.
 * - For this base scaffold we use a single browser-friendly Supabase client.
 * - Later, you may add a server-side client (cookies/SSR) for protected routes.
 */

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

