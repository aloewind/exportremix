"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function GlobalNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-18 md:h-20">
          {/* Logo - Added flex-shrink-0 to prevent wrapping */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <Image
              src="/logo.png"
              alt="ExportRemix Logo"
              width={36}
              height={36}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9"
            />
            <span className="whitespace-nowrap text-lg font-bold text-foreground sm:text-xl md:text-2xl">
              ExportRemix
            </span>
          </Link>

          {/* Desktop Navigation - Updated to only show Features, About, Pricing, Contact */}
          <div className="hidden flex-1 items-center justify-center gap-4 md:flex lg:gap-6 xl:gap-8">
            <Link
              href="/features"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary lg:text-base"
            >
              Features
            </Link>
            <Link
              href="/solutions"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary lg:text-base"
            >
              Solutions
            </Link>
            <Link
              href="/about"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary lg:text-base"
            >
              About
            </Link>
            <Link
              href="/pricing"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary lg:text-base"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-primary lg:text-base"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Actions - Added flex-shrink-0 and improved gap */}
          <div className="hidden flex-shrink-0 items-center gap-2 md:flex lg:gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="whitespace-nowrap" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" className="whitespace-nowrap" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - Added flex-shrink-0 */}
          <div className="flex flex-shrink-0 items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Updated to only show Features, About, Pricing, Contact */}
        {mobileMenuOpen && (
          <div className="border-t border-border/50 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/features"
                className="text-base text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/solutions"
                className="text-base text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              <Link
                href="/about"
                className="text-base text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/pricing"
                className="text-base text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/contact"
                className="text-base text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 border-t border-border/50 pt-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
