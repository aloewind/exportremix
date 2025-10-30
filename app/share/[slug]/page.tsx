import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ShareView } from "@/components/share/share-view"

export const dynamic = "force-dynamic"

export default async function SharePage({ params }: { params: { slug: string } }) {
  const supabase = await createServerClient()

  // Fetch shareable link
  const { data: link, error } = await supabase.from("shareable_links").select("*").eq("slug", params.slug).single()

  if (error || !link) {
    notFound()
  }

  // Check if expired
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="text-muted-foreground">This shareable link has expired.</p>
        </div>
      </div>
    )
  }

  return <ShareView link={link} />
}
