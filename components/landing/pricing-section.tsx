"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PricingButton } from "./pricing-button"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started with AI-powered export management",
      features: [
        "100 AI analysis requests per month",
        "Basic manifest validation",
        "HS Code verification",
        "Email support",
        "Community access",
      ],
      cta: "Get Started Free",
      plan: "free" as const,
      priceId: undefined, // Free plan doesn't need a price ID
      popular: false,
    },
    {
      name: "Pro",
      price: "$199",
      period: "/month",
      description: "For growing businesses that need advanced features",
      features: [
        "Unlimited AI analysis requests",
        "Advanced manifest validation",
        "Real-time tariff predictions",
        "API access",
        "Priority email support",
        "Custom integrations",
        "Team collaboration (up to 5 users)",
      ],
      cta: "Start Pro Trial",
      plan: "pro" as const,
      priceId: "price_pro_monthly", // Replace with your actual Stripe Price ID
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$499",
      period: "/month",
      description: "For large organizations with custom needs",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Custom API endpoints",
        "Dedicated account manager",
        "24/7 priority support",
        "Custom AI model training",
        "SLA guarantee",
        "Advanced analytics & reporting",
      ],
      cta: "Start Enterprise Trial",
      plan: "enterprise" as const,
      priceId: "price_enterprise_monthly", // Replace with your actual Stripe Price ID
      popular: false,
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs. All plans include our core AI-powered features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <PricingButton plan={plan.plan} priceId={plan.priceId} variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </PricingButton>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}
