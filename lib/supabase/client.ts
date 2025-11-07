import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (client) {
    return client
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[Supabase] Missing environment variables. Using placeholder values. Some features may not work.")
  }

  try {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    return client
  } catch (error) {
    console.error("Error initializing Supabase browser client:", error)
    // Return a mock client to prevent crashes
    throw error
  }
}
