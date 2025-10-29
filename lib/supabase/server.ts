import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase configuration is missing. Please check environment variables.")
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

    return client
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    throw error
  }
}

export async function getSupabaseServerClient() {
  return createServerClient()
}

export async function getSupabaseRouteHandlerClient() {
  return createServerClient()
}
