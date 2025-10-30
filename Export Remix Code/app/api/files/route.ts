import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// GET - Fetch all uploaded files for the current user
export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Fetching files for user:", user.id)

    const { data: files, error } = await supabase
      .from("manifests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching files:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Files fetched successfully:", files?.length)
    return NextResponse.json({ files })
  } catch (error: any) {
    console.error("[v0] Error in GET /api/files:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save a new uploaded file
export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { file_name, file_type, data } = body

    console.log("[v0] Saving file:", file_name, "for user:", user.id)

    const { data: savedFile, error } = await supabase
      .from("manifests")
      .insert({
        user_id: user.id,
        file_name,
        file_type,
        data,
        status: "uploaded",
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving file:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] File saved successfully:", savedFile.id)
    return NextResponse.json({ file: savedFile })
  } catch (error: any) {
    console.error("[v0] Error in POST /api/files:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a file
export async function DELETE(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("id")

    if (!fileId) {
      return NextResponse.json({ error: "File ID required" }, { status: 400 })
    }

    console.log("[v0] Deleting file:", fileId, "for user:", user.id)

    const { error } = await supabase.from("manifests").delete().eq("id", fileId).eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting file:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] File deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error in DELETE /api/files:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
