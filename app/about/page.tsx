import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle2, XCircle } from "lucide-react"
import type { Metadata } from "next"
import { InfoTooltip } from "@/components/ui/info-tooltip"

export const metadata: Metadata = {
  title: "About ExportRemix - Unique AI-Powered Logistics Intelligence",
  description:
    "Learn how ExportRemix uniquely combines predictive tariff surge detection with intuitive vibe-prompted remixing to solve 76% of supply chain disruptions.",
}

const SMART_FIXER_EXPLANATION = `"Smart manifest fixer" means the app's AI agents automatically analyze your manifest for issues (e.g., mismatched formats from multiple sources, potential tariff risks like a 19% surge), then regenerate an optimized version – e.g., reformatting for compliance, suggesting reroutes to cut 35% costs, or balancing risks with recommendations in a customized view (like "Nordic calm" style for clearer visuals).`

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
              Solving 76% of Supply Chain Disruptions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              About <span className="text-primary">ExportRemix</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Predictive surges with AI-powered smart manifest fixing for harmony, solving pains like 76% disruptions –
              unique vs. traditional tools that only optimize costs.
            </p>
          </div>

          {/* What Makes Us Unique */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">What Makes Us Unique?</h2>
            <div className="space-y-4 text-base leading-relaxed">
              <p>
                <strong className="text-primary">ExportRemix</strong> isn't just another logistics optimization tool.
                While traditional platforms focus solely on cost optimization and rigid workflows, we've pioneered a
                revolutionary approach that combines:
              </p>
              <ul className="space-y-3 ml-6">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong>Predictive Tariff Surge Detection:</strong> Real-time monitoring of WTO, CBP, and USITC
                    feeds with AI-powered analysis that detects threats like 19% tariff increases before they impact
                    your supply chain.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong>Smart Manifest Fixer:</strong>{" "}
                    <InfoTooltip content={SMART_FIXER_EXPLANATION} className="ml-1" />
                    AI agents automatically analyze your manifest for issues (mismatched formats, tariff risks like 19%
                    surges), then regenerate an optimized version with compliance fixes, cost-saving reroutes (cut 35%
                    costs), and risk balancing in customized views like "Nordic calm" style for clearer visuals.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <span>
                    <strong>Harmonized Export Data:</strong> Automatically align your data with global trade standards
                    while maintaining your unique operational style and preferences.
                  </span>
                </li>
              </ul>
            </div>
          </Card>

          {/* Comparison Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">How We Compare</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Traditional Tools</th>
                    <th className="text-center py-3 px-4 text-primary">ExportRemix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-3 px-4 font-medium">Cost Optimization</td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Predictive Surge Detection</td>
                    <td className="py-3 px-4 text-center">
                      <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Intuitive Remixing (Natural Language)</td>
                    <td className="py-3 px-4 text-center">
                      <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Real-Time Policy Monitoring</td>
                    <td className="py-3 px-4 text-center">
                      <XCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="unique" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-base font-semibold hover:text-primary">
                  How is ExportRemix unique compared to other logistics tools?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p className="mb-3">
                    Traditional tools focus on basic optimization; we use smart manifest fixing for intuitive harmony.
                  </p>
                  <p>
                    We solve 76% of supply chain disruptions by combining predictive tariff surge detection with smart
                    manifest fixing - something no other platform offers.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="smart-fixer" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-base font-semibold hover:text-primary">
                  What is "smart manifest fixer" and how does it work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p>{SMART_FIXER_EXPLANATION}</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="predictions" className="border border-border rounded-lg px-4">
                <AccordionTrigger className="text-base font-semibold hover:text-primary">
                  How accurate are the tariff surge predictions?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <p>
                    Our Policy Sentinel monitors real-time feeds from the WTO, CBP, and USITC 24/7, achieving a 76%
                    disruption prevention rate with 19% average surge detection before official announcements.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  )
}
