import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  TrendingUp,
  Shield,
  Bell,
  BarChart3,
  Upload,
  Palette,
  Globe,
  Zap,
  DollarSign,
  FileText,
  Lock,
  Heart,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features | ExportRemix",
  description:
    "Discover how ExportRemix uses AI to predict tariff surges, rewrite manifests, and save you $10K+ per shipment.",
}

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Manifest Remixing",
      description:
        "Our advanced AI analyzes your shipping manifests and automatically rewrites them to optimize for cost savings, compliance, and efficiency.",
      benefits: ["Automatic optimization", "Smart categorization", "Real-time processing"],
    },
    {
      icon: TrendingUp,
      title: "Tariff Surge Prediction",
      description:
        "Stay ahead of the market with predictive analytics that forecast tariff changes up to 30 days in advance, giving you time to adjust.",
      benefits: ["30-day forecasts", "Historical analysis", "Confidence scoring"],
    },
    {
      icon: Shield,
      title: "Policy Sentinel",
      description:
        "Automated compliance checking ensures your manifests meet all regulatory requirements across multiple jurisdictions.",
      benefits: ["Multi-country compliance", "Real-time validation", "Audit trail"],
    },
    {
      icon: Bell,
      title: "Smart Alerts & Notifications",
      description:
        "Get instant in-app notifications when tariff surges are detected, compliance issues arise, or optimization opportunities appear.",
      benefits: ["Real-time alerts", "Custom thresholds", "Priority notifications"],
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics Dashboard",
      description:
        "Visualize your savings, track performance metrics, and gain insights into your shipping operations with comprehensive analytics.",
      benefits: ["Savings tracking", "Performance metrics", "Custom reports"],
    },
    {
      icon: Upload,
      title: "Seamless Data Integration",
      description:
        "Upload manifests via CSV, Excel, or API integration. Connect directly to your existing systems for automated processing.",
      benefits: ["Multiple formats", "API access", "Batch processing"],
    },
    {
      icon: DollarSign,
      title: "$10K+ Savings Per Shipment",
      description:
        "Our AI identifies cost-saving opportunities that turn looming losses into significant savings, averaging $10,000+ per shipment.",
      benefits: ["Proven ROI", "Transparent calculations", "Savings guarantee"],
    },
    {
      icon: Zap,
      title: "Lightning-Fast Processing",
      description:
        "Process thousands of manifests in seconds with our optimized infrastructure. No waiting, no delays, just results.",
      benefits: ["Sub-second processing", "Bulk operations", "99.9% uptime"],
    },
    {
      icon: Palette,
      title: "Customizable Workflows",
      description: "Tailor ExportRemix to your business needs with custom vibes, themes, and workflow configurations.",
      benefits: ["Custom themes", "Workflow automation", "Team preferences"],
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Work in your preferred language with support for English, Spanish, and more coming soon.",
      benefits: ["Multiple languages", "Localized content", "Regional compliance"],
    },
    {
      icon: FileText,
      title: "Comprehensive Documentation",
      description: "Access detailed guides, API documentation, and best practices to get the most out of ExportRemix.",
      benefits: ["Step-by-step guides", "API reference", "Video tutorials"],
    },
    {
      icon: Lock,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with bank-level encryption, SOC 2 compliance, and regular security audits.",
      benefits: ["End-to-end encryption", "SOC 2 certified", "Regular audits"],
    },
    {
      icon: Heart,
      title: "Sentiment-Aware Volatility Coach",
      description:
        "AI detects emotional cues in your interactions (text tone, urgency patterns) and provides personalized coaching to help you navigate high-stress decisions with calm, balanced guidance.",
      benefits: [
        "Emotion detection in prompts",
        "Personalized coaching tips",
        "Stress-reducing workflows",
        "Harmony-focused suggestions",
      ],
      isNew: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border/50 bg-gradient-to-b from-background to-muted/20 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Features That Transform Your Export Operations
            </h1>
            <p className="mb-8 text-pretty text-lg text-muted-foreground sm:text-xl">
              When tariffs spike and trade routes twist into chaos, ExportRemix brings calm to the storm with AI-powered
              predictions, automated compliance, and proven savings.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything You Need to Stay Ahead
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ExportRemix combines cutting-edge AI with practical tools to give you the edge in international trade.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className={`transition-shadow hover:shadow-lg ${
                    feature.isNew ? "border-2 border-primary bg-primary/5 relative" : ""
                  }`}
                >
                  {feature.isNew && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold">
                      NEW
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Detailed explanation section for Sentiment Coach */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Sentiment-Aware Volatility Coach: Deep Dive</CardTitle>
                </div>
                <CardDescription className="text-base">
                  The human-centric AI layer that transforms emotional friction into productive flow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">How It Works</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Our AI analyzes subtle emotional cues in your interactions—word choice in text prompts (e.g., "This
                    delay is killing me"), urgency patterns, and stress indicators. Using advanced sentiment analysis,
                    it classifies emotions like "stressed," "uncertain," or "confident" on a real-time scale.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Personalized Coaching in Action</h4>
                  <div className="space-y-3">
                    <div className="bg-background/50 border border-border rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Example: High Stress Detected</p>
                      <p className="text-sm text-muted-foreground">
                        When you type "Fix this mess now" during a 19% tariff surge, the AI responds: "Detected high
                        uncertainty – let's balance it with a calm remix: Here's an optimized manifest with 35% cost-cut
                        reroutes to ease the pressure."
                      </p>
                    </div>
                    <div className="bg-background/50 border border-border rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Example: Uncertainty Support</p>
                      <p className="text-sm text-muted-foreground">
                        If it senses hesitation, it might suggest: "Uncertain? Here's a low-risk remix with confidence
                        scoring" or "Switch to zen mode for clearer charts?"
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2">Benefits for Your Team</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        <strong>Reduces Decision Fatigue:</strong> In chaotic trade environments (e.g., Red Sea delays
                        spiking rates 35-60%), stay calm and make better choices
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        <strong>Boosts Productivity:</strong> Transform stress into actionable insights with coaching
                        tips tied to real data
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        <strong>Improves Mental Resilience:</strong> Acknowledges the emotional reality of high-stress
                        logistics work
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        <strong>Unique Competitive Edge:</strong> No other logistics AI offers sentiment-aware
                        coaching—this is ExportRemix's "secret weapon"
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-primary mb-2">Inspired by Yin-Yang Balance</p>
                  <p className="text-sm text-muted-foreground">
                    This feature embodies our core philosophy: turning "emotional pains" (uncertainty from sudden
                    surges) into "productive flows" by offering calming, actionable guidance. It's not therapy—it's a
                    subtle nudge that keeps you focused on export harmony while addressing the human side of volatility.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Transform Your Export Operations?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join hundreds of exporters who are already saving thousands per shipment with ExportRemix.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/support">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
