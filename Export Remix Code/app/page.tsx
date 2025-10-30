"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { getABVariant, trackABTest, type ABVariant } from "@/lib/ab-testing"

const HeroSection = dynamic(
  () => import("@/components/landing/hero-section").then((mod) => ({ default: mod.HeroSection })),
  { ssr: true },
)

const FeaturesSection = dynamic(
  () => import("@/components/landing/features-section").then((mod) => ({ default: mod.FeaturesSection })),
  { ssr: true, loading: () => <div className="min-h-[400px]" /> },
)

const HowItWorksSection = dynamic(
  () => import("@/components/landing/how-it-works-section").then((mod) => ({ default: mod.HowItWorksSection })),
  { ssr: true, loading: () => <div className="min-h-[400px]" /> },
)

const BenefitsSection = dynamic(
  () => import("@/components/landing/benefits-section").then((mod) => ({ default: mod.BenefitsSection })),
  { ssr: true, loading: () => <div className="min-h-[400px]" /> },
)

const UseCasesSection = dynamic(
  () => import("@/components/landing/use-cases-section").then((mod) => ({ default: mod.UseCasesSection })),
  { ssr: true, loading: () => <div className="min-h-[400px]" /> },
)

const StatsSection = dynamic(
  () => import("@/components/landing/stats-section").then((mod) => ({ default: mod.StatsSection })),
  { ssr: true, loading: () => <div className="min-h-[200px]" /> },
)

const IntegrationsSection = dynamic(
  () => import("@/components/landing/integrations-section").then((mod) => ({ default: mod.IntegrationsSection })),
  { ssr: true, loading: () => <div className="min-h-[300px]" /> },
)

const PricingSection = dynamic(
  () => import("@/components/landing/pricing-section").then((mod) => ({ default: mod.PricingSection })),
  { ssr: true, loading: () => <div className="min-h-[400px]" /> },
)

const TrustBadgesSection = dynamic(
  () => import("@/components/landing/trust-badges-section").then((mod) => ({ default: mod.TrustBadgesSection })),
  { ssr: true },
)

const CTASection = dynamic(
  () => import("@/components/landing/cta-section").then((mod) => ({ default: mod.CTASection })),
  { ssr: true },
)

export default function LandingPage() {
  const [variant, setVariant] = useState<ABVariant>("A")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const assignedVariant = getABVariant("landing")
    setVariant(assignedVariant)
    trackABTest(assignedVariant, "landing")

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "ExportRemix",
      description:
        "Harmonize Global Trade with AI-Powered Export Intelligence. Predict tariffs, remix manifests, and stay calm under pressure.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          name: "Free Plan",
          description: "100 requests per month with basic predictions",
        },
        {
          "@type": "Offer",
          price: "199",
          priceCurrency: "USD",
          name: "Pro Plan",
          description: "Unlimited requests with full API integration and advanced predictions",
        },
        {
          "@type": "Offer",
          price: "499",
          priceCurrency: "USD",
          name: "Enterprise Plan",
          description: "Everything in Pro plus custom APIs, team collaboration, and priority support",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "127",
        bestRating: "5",
        worstRating: "1",
      },
    }

    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <UseCasesSection />
      <StatsSection />
      <IntegrationsSection />
      <PricingSection />
      <TrustBadgesSection />
      <CTASection />
    </div>
  )
}
