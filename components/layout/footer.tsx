"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ]

  const productLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Contact", href: "/contact" },
  ]

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ]

  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Top Section: Tagline & CTA */}
        <div className="text-center mb-12 md:mb-16 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/logo.png"
              alt="ExportRemix"
              width={48}
              height={48}
              className="rounded-lg w-10 h-10 md:w-12 md:h-12"
            />
            <h3 className="text-xl md:text-2xl font-bold text-foreground">ExportRemix</h3>
          </div>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 text-balance">
            When tariffs spike and trade routes twist into chaos, ExportRemix brings calm to the storm — your AI agent
            predicts surges, rewrites manifests, and turns looming losses into $10K+ savings per shipment. It's the edge
            that makes competitors wonder how you always saw it coming.
          </p>

          <div className="space-y-4">
            <p className="text-sm md:text-base font-semibold text-foreground">
              Don't react to the next surge — own it.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 text-base md:text-lg h-auto"
              >
                Get Started Free
              </Button>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground">
              Unlock effortless export mastery today, where every change becomes your advantage.
            </p>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mb-12 max-w-4xl mx-auto">
          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm md:text-base">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm md:text-base">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ExportRemix. All rights reserved. Predictive harmony for your supply chain.
          </p>
        </div>
      </div>
    </footer>
  )
}
