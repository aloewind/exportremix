import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SupportForm } from "@/components/support/support-form"
import { FAQ } from "@/components/support/faq"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Support & Contact - ExportRemix",
  description:
    "Get help with ExportRemix. Contact our support team or browse our FAQ for answers about tariff predictions, smart manifest fixing, and export harmonization.",
}

export default async function SupportPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen gradient-flow space-y-8">
        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="ExportRemix"
                width={32}
                height={32}
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">ExportRemix</span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Support & Contact</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about predictive tariff surges or remixing? We're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <SupportForm />
            <FAQ />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
