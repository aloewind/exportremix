import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

let schemaVerified = false

async function verifySchema(client: ReturnType<typeof createSupabaseServerClient>) {
  if (schemaVerified) {
    return true
  }

  try {
    // Check for key tables/columns
    const tablesToCheck = [
      { table: "user_settings", columns: ["user_id", "tier", "vibe_preference"] },
      { table: "profiles", columns: ["id", "is_admin"] },
      { table: "organizations", columns: ["id", "name"] },
      { table: "user_api_integrations", columns: ["user_id", "is_enabled"] },
    ]

    for (const { table, columns } of tablesToCheck) {
      try {
        const { error } = await client.from(table).select(columns[0]).limit(1)
        if (error && error.code === "42P01") {
          // Table doesn't exist
          console.log(`[Supabase] Table ${table} not found - schema may need migration`)
          return false
        }
      } catch (err) {
        console.log(`[Supabase] Error checking table ${table}:`, err)
        return false
      }
    }

    schemaVerified = true
    console.log("[Supabase] Schema verified - all required tables exist")
    return true
  } catch (error) {
    console.error("[Supabase] Schema verification error:", error)
    return false
  }
}

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[Supabase] Missing environment variables. Using placeholder values. Some features may not work.")
  }

  try {
    const cookieStore = await cookies()

    const client = createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error("Error setting cookies:", error)
          }
        },
      },
    })

    // Only verify schema if real credentials are provided
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await verifySchema(client)
    }

    return client
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    // Don't throw - allow the app to continue in limited mode
    throw error
  }
}

export async function getSupabaseServerClient() {
  return createServerClient()
}

export async function getSupabaseRouteHandlerClient() {
  return createServerClient()
}
