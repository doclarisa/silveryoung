"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

/** Supabase client for use in the browser (Client Components). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
