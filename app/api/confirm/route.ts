import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    console.log("[v0] Email confirmation request - token:", token, "email:", email)

    if (!token || !email) {
      console.error("[v0] Missing token or email in confirmation request")
      return NextResponse.redirect(new URL("/login?error=invalid_confirmation", request.url))
    }

    const supabase = await createServerClient()

    // Find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (profileError || !profile) {
      console.error("[v0] User not found for email:", email, profileError)
      return NextResponse.redirect(new URL("/login?error=user_not_found", request.url))
    }

    console.log("[v0] Found user profile:", profile.id)

    // Update user_settings to mark as confirmed
    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        is_confirmed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id)

    if (updateError) {
      console.error("[v0] Error updating user_settings:", updateError)
      return NextResponse.redirect(new URL("/login?error=confirmation_failed", request.url))
    }

    console.log("[v0] Successfully confirmed email for user:", email)

    // Redirect to login with success message
    return NextResponse.redirect(new URL("/login?confirmed=true", request.url))
  } catch (error) {
    console.error("[v0] Error in email confirmation:", error)
    return NextResponse.redirect(new URL("/login?error=confirmation_error", request.url))
  }
}
