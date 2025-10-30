import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createServerClient()
    const { slug } = params

    // Fetch shareable link
    const { data: link, error } = await supabase.from("shareable_links").select("*").eq("slug", slug).single()

    if (error || !link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Check if expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: "Link expired" }, { status: 410 })
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error("Error fetching shareable link:", error)
    return NextResponse.json({ error: "Failed to fetch link" }, { status: 500 })
  }
}
