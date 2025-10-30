import { PricingSection } from "@/components/landing/pricing-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing - ExportRemix",
  description:
    "Choose the perfect plan for your export business. From free to enterprise, we have a solution for every need.",
}

export const dynamic = "force-dynamic"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. All plans include our core AI-powered features.
          </p>
        </div>
        <PricingSection />
      </div>
    </div>
  )
}
