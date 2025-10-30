"use client"

import { Card } from "@/components/ui/card"
import { Truck, Package, Building2 } from "lucide-react"

export function UseCasesSection() {
  const useCases = [
    {
      icon: Truck,
      title: "Freight Forwarders",
      description: "Scale 100+ manifests per day with AI automation",
      benefits: ["Batch processing", "Multi-client management", "Real-time tracking", "Automated compliance checks"],
    },
    {
      icon: Package,
      title: "Exporters",
      description: "Reduce customs delays by 90% with smart optimization",
      benefits: ["HS code validation", "Duty optimization", "Document generation", "Compliance verification"],
    },
    {
      icon: Building2,
      title: "3PLs",
      description: "Offer value-add AI service to your clients",
      benefits: ["White-label options", "API integration", "Client dashboards", "Revenue sharing"],
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built for <span className="text-primary">Every Export Professional</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're a freight forwarder, exporter, or 3PL, we have the tools you need
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <useCase.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                <p className="text-muted-foreground mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit) => (
                    <li key={benefit} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
