"use client";

import { createBrowserClient } from "@supabase/ssr";

// Singleton pattern to prevent multiple clients in dev mode (HMR)
const globalSupabase = global as unknown as { 
  browserClient: ReturnType<typeof createBrowserClient> | undefined 
};

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  if (!globalSupabase.browserClient) {
    globalSupabase.browserClient = createBrowserClient(url, anonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Disable navigator lock to prevent "lock stolen" errors in dev
        // Correct signature for LockFunc: (name, acquireTimeout, acquire) => acquire()
        lock: async (name: string, acquireTimeout: number, acquire: () => Promise<any>) => {
          return acquire();
        }
      }
    });
  }

  return globalSupabase.browserClient;
}
