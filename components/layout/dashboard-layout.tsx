"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Upload,
  Database,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  HelpCircle,
  Palette,
  BarChart3,
  FolderOpen,
  CreditCard,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import Image from "next/image"
import { useTranslations } from "@/hooks/use-translations"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = getSupabaseBrowserClient()
  const t = useTranslations()

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("[DashboardLayout] Error fetching profile:", profileError)
        }

        setIsAdmin(profile?.is_admin || false)
      }
    }
    checkAdmin()
  }, [])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        title: t.common.error,
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    })

    router.push("/login")
    router.refresh()
  }

  const navigation = [
    { name: t.nav.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { name: t.nav.upload, href: "/dashboard/upload", icon: Upload },
    { name: t.nav.files, href: "/dashboard/files", icon: FolderOpen },
    { name: "Back Office", href: "/dashboard/back-office", icon: Database },
    { name: "API Connect", href: "/dashboard/integrations", icon: Database },
    { name: "API Data", href: "/dashboard/api-data", icon: Database },
    { name: t.nav.remix, href: "/dashboard/remix", icon: Sparkles },
    { name: "Vibes", href: "/dashboard/vibes", icon: Palette },
    { name: "Analytics", href: "/dashboard/my-analytics", icon: BarChart3 },
    { name: "Upgrade", href: "/upgrade", icon: CreditCard },
    { name: t.nav.support, href: "/support", icon: HelpCircle },
    { name: t.nav.settings, href: "/dashboard/settings", icon: Settings },
    ...(isAdmin ? [{ name: "Admin", href: "/dashboard/admin", icon: Shield }] : []),
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-card/95">
        <div className="w-full px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <Image src="/logo.png" alt="ExportRemix" width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-lg text-foreground hidden sm:inline">ExportRemix</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="h-9 flex items-center">
                <ThemeToggle />
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 h-9 bg-transparent">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t.nav.signOut}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 ml-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 border-r border-border/50 bg-card/50 flex-col">
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-10 font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>
        </aside>

        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
            <aside className="fixed left-0 top-14 bottom-0 w-64 border-r border-border/50 bg-card shadow-lg">
              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-10 font-medium"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
