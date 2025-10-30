"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"

const SMART_FIXER_EXPLANATION = `"Smart manifest fixer" means the app's AI agents automatically analyze your manifest for issues (e.g., mismatched formats from multiple sources, potential tariff risks like a 19% surge), then regenerate an optimized version – e.g., reformatting for compliance, suggesting reroutes to cut 35% costs, or balancing risks with recommendations in a customized view (like "Nordic calm" style for clearer visuals).`

export function FAQ() {
  const faqs = [
    {
      question: "How does tariff surge prediction work?",
      answer:
        "Our AI analyzes real-time data from WTO, CBP, and USITC feeds to detect policy changes and predict tariff surges. The system monitors historical patterns and current trade policies to alert you before disruptions occur.",
    },
    {
      question: "What is smart manifest fixer and how do I use it?",
      answer:
        SMART_FIXER_EXPLANATION +
        " Simply upload your data and use natural language prompts like 'Balance as Nordic calm' or 'Show high-risk shipments' to let AI agents automatically fix and optimize your manifests into actionable insights.",
    },
    {
      question: "What's included in the free tier?",
      answer:
        "The free tier includes 100 requests per month, basic AI predictions, manifest uploads, and policy monitoring. You can analyze data, create smart manifest fixes, and export results with some limitations on advanced features.",
    },
    {
      question: "How accurate are the predictions?",
      answer:
        "Our AI has been trained on historical trade data and achieves high accuracy in detecting policy shifts. We've helped prevent 76% of supply chain disruptions for our users, with an average detection rate of 19% tariff surges before they impact operations.",
    },
    {
      question: "Can I share my fixed manifests?",
      answer:
        "Yes! Every fixed manifest and alert can be shared via a unique link. Click the share button on any output to generate a public URL that you can distribute to your team or stakeholders without requiring them to log in.",
    },
    {
      question: "How do I upgrade to Pro?",
      answer:
        "Visit your Settings page and navigate to the Billing tab. Click 'Upgrade to Pro' to access unlimited requests, advanced predictions, priority support, and all premium features for $199/month.",
    },
    {
      question: "What makes ExportRemix unique compared to other tools?",
      answer:
        "Traditional tools focus on basic cost optimization through rigid automation. ExportRemix uses smart manifest fixing with AI agents that understand natural language, predict tariff surges before they happen, and harmonize your data with intuitive workflows. We solve 76% of supply chain disruptions by combining predictive intelligence with human-centered design. Note: Comparisons based on publicly available features; individual results may vary.",
    },
  ]

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Frequently Asked Questions
        </CardTitle>
        <CardDescription>Quick answers to common questions about smart manifest fixing and predictions</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
