import { getSupabaseServerClient } from "@/lib/supabase/server"

export type UserRole = "user" | "admin" | "manager"

export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (error) {
      console.error(`[v0] Error fetching role for user ${userId}:`, error)
      return "user" // Default to user role on error
    }

    const role = (profile?.role as UserRole) || "user"

    console.log(`[v0] Role check for user ${userId}: ${role}`)

    return role
  } catch (error) {
    console.error(`[v0] Exception in getUserRole for ${userId}:`, error)
    return "user"
  }
}

export async function getUserTier(userId: string): Promise<string> {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: settings, error } = await supabase.from("user_settings").select("tier").eq("user_id", userId).single()

    if (error) {
      console.error(`[v0] Error fetching tier for user ${userId}:`, error)
      return "free" // Default to free tier on error
    }

    const tier = settings?.tier || "free"

    console.log(`[v0] Tier check for user ${userId}: ${tier}`)

    return tier
  } catch (error) {
    console.error(`[v0] Exception in getUserTier for ${userId}:`, error)
    return "free"
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  const tier = await getUserTier(userId)

  const result = role === "admin" || tier === "enterprise"

  console.log(`[v0] Admin check for user ${userId}: ${result} (role: ${role}, tier: ${tier})`)

  return result
}

export async function isManager(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  const result = role === "manager" || role === "admin"

  console.log(`[v0] Manager check for user ${userId}: ${result}`)

  return result
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const supabase = await getSupabaseServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] Admin access denied: No user session")
      return false
    }

    console.log(`[v0] Checking admin access for user: ${user.email}`)

    const hasAccess = await isAdmin(user.id)
    console.log(`[v0] Admin access check for ${user.email}: ${hasAccess}`)

    if (hasAccess) {
      const currentRole = await getUserRole(user.id)
      const tier = await getUserTier(user.id)

      if (tier === "enterprise" && currentRole !== "admin") {
        console.log(`[v0] Auto-granting admin role to Enterprise user ${user.email}`)
        const { error } = await supabase
          .from("profiles")
          .update({ role: "admin", updated_at: new Date().toISOString() })
          .eq("id", user.id)

        if (error) {
          console.error(`[v0] Error auto-granting admin role:`, error)
        } else {
          console.log(`[v0] Successfully auto-granted admin role to ${user.email}`)
        }
      }
    }

    return hasAccess
  } catch (error) {
    console.error("[v0] Exception in checkAdminAccess:", error)
    return false
  }
}

export async function checkManagerAccess(): Promise<boolean> {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] Manager access denied: No user session")
    return false
  }

  const hasAccess = await isManager(user.id)
  console.log(`[v0] Manager access check for ${user.email}: ${hasAccess}`)

  return hasAccess
}
