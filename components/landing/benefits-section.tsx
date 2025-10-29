"use client"

import { Card } from "@/components/ui/card"
import { DollarSign, Clock, Shield } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Save $10K+ per Shipment",
      description:
        "Avoid costly detention, demurrage, and rejection fees. Our AI optimizes your manifests to minimize duties and prevent compliance issues that lead to expensive delays.",
      stat: "$10K+ Saved",
    },
    {
      icon: Clock,
      title: "Cut Processing Time 80%",
      description:
        "Transform hours of manual work into minutes with AI automation. Upload your manifest, get instant analysis, and export compliant documents in seconds.",
      stat: "80% Faster",
    },
    {
      icon: Shield,
      title: "100% Compliance Ready",
      description:
        "Stay compliant with WCO, CBP, EU, and global customs standards. Our AI is trained on the latest regulations and automatically validates against current requirements.",
      stat: "100% Compliant",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Why Choose <span className="text-primary">ExportRemix</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real benefits that impact your bottom line and operational efficiency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="p-8 space-y-4 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
              <div className="pt-4 border-t">
                <span className="text-lg font-bold text-primary">{benefit.stat}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
