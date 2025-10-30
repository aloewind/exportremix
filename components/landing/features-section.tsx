"use client"

import { Card } from "@/components/ui/card"
import { Zap, RefreshCw, Database } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "AI Tariff Predictions",
      description: "30-second alerts on tariff surges with 95% accuracy. Stay ahead of policy changes.",
      stat: "95% Accuracy",
    },
    {
      icon: RefreshCw,
      title: "Manifest Remixing",
      description: "Auto-optimize HS codes & duties to minimize costs and maximize compliance.",
      stat: "35% Cost Savings",
    },
    {
      icon: Database,
      title: "Real-Time API Sync",
      description: "CBP • WTO • ITC live data integration for instant compliance verification.",
      stat: "24/7 Monitoring",
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Powerful Features for <span className="text-primary">Export Excellence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to streamline your export operations and stay compliant
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
              <div className="pt-2 border-t">
                <span className="text-sm font-semibold text-primary">{feature.stat}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
