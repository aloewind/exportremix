"use server"

import { createClient } from "@supabase/supabase-js"

export async function completeUserSignup(userId: string, email: string, fullName: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[ExportRemix] Missing Supabase credentials")
      return {
        success: false,
        error: "Server configuration error. Please contact support.",
      }
    }

    // Create admin client that bypasses RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("[ExportRemix] Profile check error:", profileCheckError)
    }

    if (!existingProfile) {
      // Create profile
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        email: email,
        full_name: fullName,
        is_admin: false,
        theme_preference: "dark",
      })

      if (profileError) {
        console.error("[ExportRemix] Profile creation error:", profileError)
        return {
          success: false,
          error: `Failed to create profile: ${profileError.message}`,
        }
      }
    }

    // Check if subscription exists
    const { data: existingSubscription, error: subCheckError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (subCheckError && subCheckError.code !== "PGRST116") {
      console.error("[ExportRemix] Subscription check error:", subCheckError)
    }

    if (!existingSubscription) {
      // Create free tier subscription
      const { error: subscriptionError } = await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        tier: "free",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })

      if (subscriptionError) {
        console.error("[ExportRemix] Subscription creation error:", subscriptionError)
        return {
          success: false,
          error: `Failed to create subscription: ${subscriptionError.message}`,
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[ExportRemix] Signup completion error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
    }
  }
}
