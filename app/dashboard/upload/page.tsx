import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { UploadPageClient } from "@/components/data/upload-page-client"

export const dynamic = "force-dynamic"

export default async function UploadPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <UploadPageClient />
}
