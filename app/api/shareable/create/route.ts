import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { linkType, data } = body

    // Generate unique slug
    const slug = nanoid(10)

    // Create shareable link
    const { data: link, error } = await supabase
      .from("shareable_links")
      .insert({
        user_id: user.id,
        link_type: linkType,
        data,
        slug,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single()

    if (error) throw error

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/share/${slug}`

    return NextResponse.json({ link, shareUrl })
  } catch (error) {
    console.error("Error creating shareable link:", error)
    return NextResponse.json({ error: "Failed to create shareable link" }, { status: 500 })
  }
}
