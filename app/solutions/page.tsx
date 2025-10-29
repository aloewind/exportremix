import Link from "next/link"
import {
  AlertTriangle,
  FileWarning,
  Users,
  DollarSign,
  Database,
  CheckCircle2,
  TrendingDown,
  Shield,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SolutionsPage() {
  const solutions = [
    {
      id: 1,
      icon: AlertTriangle,
      title: "Supplier Quality & Reliability Issues",
      problem: {
        description:
          "Exporters struggle with unreliable suppliers—poor product quality, fake certifications, and delivery delays lead to returns, lost clients, and financial losses.",
        quote:
          "\"Alibaba is a minefield – you don't know who you're dealing with, quality cut to the bone, potential regulatory issues.\"",
        source: "Supply Chain Professional, 2025",
        stats: "40% of exporters face quality defects, costing 15-20% margins due to rework and returns.",
      },
      solution: {
        title: "AI-Powered Quality Analysis",
        description:
          "Our smart manifest fixer AI analyzes shipment data for quality flags—mismatched HS codes, suspicious certifications, and supplier risk patterns. The system remixes manifests into optimized versions with built-in compliance checks and supplier risk predictions.",
        benefits: [
          "Reduce defects by 25% through proactive remixes",
          "Detect fake certifications before shipment",
          "Save $10K+ per shipment in avoided returns",
          "Turn supplier 'minefields' into harmonious flows",
        ],
      },
    },
    {
      id: 2,
      icon: FileWarning,
      title: "Customs Compliance Confusion & Delays",
      problem: {
        description:
          "Confusing customs processes, paperwork errors, and regulatory changes cause 2-4 week delays and costly fines. First-time exporters struggle with complex requirements.",
        quote:
          '"Customers don\'t understand customs – Section 301 throws them off every time, even after 100 explanations."',
        source: "Logistics Manager, 2025",
        stats: "30% of shipments delayed by compliance mistakes, costing $5K-20K per incident.",
      },
      solution: {
        title: "Predictive Compliance Engine",
        description:
          "Our predictive agents detect compliance risks in manifests—format mismatches, missing documentation, and regulatory conflicts. The smart fixer automatically reformats documents and provides actionable suggestions like 'Reroute to avoid fines' or 'Update HS code for compliance.'",
        benefits: [
          "Cut delays by 50% with auto-compliance",
          "Avoid $5K-20K in fines per shipment",
          "Streamline processes for first-time exporters",
          "Real-time regulatory updates and alerts",
        ],
      },
    },
    {
      id: 3,
      icon: Users,
      title: "Intense Competition from Amateurs",
      problem: {
        description:
          "Market flooding by inexperienced freelancers and low-cost providers erodes trust and profitability. Professional exporters struggle to differentiate themselves.",
        quote:
          '"Freelancers from low-labor countries flood the market; amateurs make rookie mistakes, diluting opinions of the service."',
        source: "Export Business Owner, 2025",
        stats: "25% export business failures due to competition saturation; solopreneurs struggle for differentiation.",
      },
      solution: {
        title: "Competitive Edge Through AI Harmony",
        description:
          "ExportRemix's unique vibe-prompted remixing gives professionals a distinct advantage—custom visualizations for client pitches, predictive surge data that amateurs lack, and automated efficiency that builds credibility.",
        benefits: [
          "Boost margins by 15-20% through efficiency",
          "Stand out with data-backed predictions",
          "Custom 'vibe' presentations for clients",
          "Professional-grade tools at accessible prices",
        ],
      },
    },
    {
      id: 4,
      icon: DollarSign,
      title: "High Costs & Low Profitability from Small Orders",
      problem: {
        description:
          "Small-order clients require high effort but yield low margins, leading to burnout and unprofitability. Many exporters drop small clients entirely.",
        quote: '"Inventors and new solopreneurs make critical mistakes—small orders mean pennies for tons of work."',
        source: "Sourcing Agent, 2025",
        stats: "35% of exporters dropping small clients due to unprofitability; costs up 15% from inefficiencies.",
      },
      solution: {
        title: "Automated Small-Order Optimization",
        description:
          "Our smart fixer automates manifest remixing for quick, low-effort handling of small orders. Auto-compliance features cut processing time in half, while cost predictions optimize routing and documentation.",
        benefits: [
          "Cut processing time by 50% per order",
          "Save 35% on costs through optimized routing",
          "Turn low-margin work into profitable flows",
          "Retain small clients without burnout",
        ],
      },
    },
    {
      id: 5,
      icon: Database,
      title: "Inaccurate & Expensive Data Tools",
      problem: {
        description:
          "Market research tools are costly and unreliable, hindering buyer identification and market analysis. Exporters waste thousands on subscriptions that don't deliver.",
        quote:
          '"Data tools not useful or accurate – too expensive; people use fake names to safeguard their business."',
        source: "Export Consultant, 2025",
        stats: "40% of exporters complain of data tool failures, costing $2K-5K/month in wasted subscriptions.",
      },
      solution: {
        title: "Accurate, Affordable Predictions",
        description:
          "ExportRemix provides accurate surge predictions and market insights at a fraction of the cost. Free-tier access for basic predictions, with pro APIs offering comprehensive data for serious exporters.",
        benefits: [
          "Reduce tool costs by 60% or more",
          "Access accurate surge and market data",
          "Free tier for testing and small operations",
          "Pro APIs for comprehensive insights",
        ],
      },
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-background to-muted/20 py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              Real Problems, Real Solutions
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Export Industry Issues & How We Fix Them
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              From supplier quality nightmares to customs confusion—discover how ExportRemix turns your biggest export
              pains into harmonious, profitable flows.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Start Solving Issues Free
                  <Zap className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">View All Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-20">
            {solutions.map((solution, index) => {
              const Icon = solution.icon
              const isEven = index % 2 === 0

              return (
                <div
                  key={solution.id}
                  className={`grid gap-8 lg:grid-cols-2 lg:gap-12 ${isEven ? "" : "lg:grid-flow-dense"}`}
                >
                  {/* Problem Section */}
                  <Card
                    className={`border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 p-6 sm:p-8 ${
                      isEven ? "" : "lg:col-start-2"
                    }`}
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <div className="rounded-lg bg-destructive/10 p-3">
                        <Icon className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h2 className="mb-2 text-2xl font-bold">
                          Issue #{solution.id}: {solution.title}
                        </h2>
                      </div>
                    </div>

                    <p className="mb-4 text-muted-foreground">{solution.problem.description}</p>

                    <blockquote className="mb-4 border-l-4 border-destructive/30 bg-background/50 p-4 italic">
                      <p className="mb-2 text-sm">{solution.problem.quote}</p>
                      <footer className="text-xs text-muted-foreground">— {solution.problem.source}</footer>
                    </blockquote>

                    <div className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3">
                      <TrendingDown className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                      <p className="text-sm font-medium">{solution.problem.stats}</p>
                    </div>
                  </Card>

                  {/* Solution Section */}
                  <Card
                    className={`border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:p-8 ${
                      isEven ? "" : "lg:col-start-1 lg:row-start-1"
                    }`}
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-2xl font-bold text-primary">How ExportRemix Fixes It</h3>
                        <p className="text-lg font-semibold">{solution.solution.title}</p>
                      </div>
                    </div>

                    <p className="mb-6 text-muted-foreground">{solution.solution.description}</p>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Key Benefits:</p>
                      {solution.solution.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                          <p className="text-sm font-medium">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-muted/20 to-background py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Turn Your Export Pains Into Profits?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of exporters who've transformed their operations with ExportRemix. Start free and
              experience the harmony of AI-powered export management.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Get Started Free
                  <Zap className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">View Dashboard Demo</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required • Free tier includes 10 remixes/month • Upgrade anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
