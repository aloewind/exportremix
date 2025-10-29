"use client"

import { Shield, Lock, Globe } from "lucide-react"

export function TrustBadgesSection() {
  const badges = [
    {
      icon: Shield,
      title: "SOC 2 Compliant",
      description: "Enterprise-grade security",
    },
    {
      icon: Lock,
      title: "256-bit SSL",
      description: "Bank-level encryption",
    },
    {
      icon: Globe,
      title: "GDPR Ready",
      description: "Privacy compliant",
    },
  ]

  return (
    <section className="py-12 bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{badge.title}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
