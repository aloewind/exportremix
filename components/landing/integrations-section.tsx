"use client"

import { Card } from "@/components/ui/card"

export function IntegrationsSection() {
  const integrations = [
    { name: "CBP", description: "US Customs & Border Protection" },
    { name: "WTO", description: "World Trade Organization" },
    { name: "ITC", description: "International Trade Commission" },
    { name: "Resend", description: "Email Notifications" },
    { name: "Stripe", description: "Secure Payments" },
    { name: "OpenAI", description: "AI Analysis" },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted <span className="text-primary">Integrations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connected to the world's leading trade and technology platforms
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {integrations.map((integration) => (
            <Card
              key={integration.name}
              className="p-6 flex flex-col items-center justify-center text-center space-y-2 hover:shadow-lg transition-shadow"
            >
              <div className="text-2xl font-bold text-primary">{integration.name}</div>
              <div className="text-xs text-muted-foreground">{integration.description}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
