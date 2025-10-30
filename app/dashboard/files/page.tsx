import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { FilesPageClient } from "@/components/files/files-page-client"

export const dynamic = "force-dynamic"

export default async function FilesPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return <FilesPageClient />
}
