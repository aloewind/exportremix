export interface SubscriptionTier {
  id: string
  name: string
  description: string
  priceInCents: number
  priceId?: string // Stripe price ID for production
  features: string[]
  limits: {
    requestsPerMonth: number | "unlimited"
    advancedPredictions: boolean
    prioritySupport: boolean
    customAPIs?: boolean
    teamCollaboration?: boolean
  }
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started with basics",
    priceInCents: 0,
    features: [
      "100 AI requests per month",
      "Mock APIs for testing",
      "Basic predictions",
      "CSV export",
      "Community support",
    ],
    limits: {
      requestsPerMonth: 100,
      advancedPredictions: false,
      prioritySupport: false,
      customAPIs: false,
      teamCollaboration: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Unlimited power with full API integration",
    priceInCents: 19900, // $199.00
    features: [
      "Unlimited AI requests",
      "Full API integration (WTO, CBP, USITC)",
      "Advanced predictions & remixing",
      "Unlimited agents",
      "Priority in-app alerts",
      "Analytics dashboard",
      "Email support",
      "Unlock $10K+ savings per shipment",
    ],
    limits: {
      requestsPerMonth: "unlimited",
      advancedPredictions: true,
      prioritySupport: false,
      customAPIs: false,
      teamCollaboration: false,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom APIs, teams, and priority support",
    priceInCents: 49900, // $499.00
    features: [
      "Everything in Pro",
      "Custom API integrations",
      "Team collaboration (up to 10 users)",
      "Priority support (24/7)",
      "Dedicated account manager",
      "Custom training & onboarding",
      "SLA guarantees",
      "Advanced security features",
      "Transform entire operations seamlessly",
    ],
    limits: {
      requestsPerMonth: "unlimited",
      advancedPredictions: true,
      prioritySupport: true,
      customAPIs: true,
      teamCollaboration: true,
    },
  },
]
