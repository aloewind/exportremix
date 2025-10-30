import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"

export function FAQSection() {
  const faqs = [
    {
      question: "What is ExportRemix?",
      answer:
        "ExportRemix is an AI-powered supply chain platform that helps businesses streamline their export operations, ensure compliance, and reduce errors in customs documentation.",
    },
    {
      question: "How does the AI file analyzer work?",
      answer:
        "Our AI analyzer uses GPT-4o to scan your manifest files (CSV, JSON, XML, EDI, PDF) and detect errors, validate HS codes, check duty calculations, and ensure WCO compliance. It provides detailed reports with priority levels for each issue found.",
    },
    {
      question: "What file formats do you support?",
      answer:
        "We support CSV, JSON, XML, EDI, and PDF file formats. Our system can parse and analyze all common logistics manifest formats used in international trade.",
    },
    {
      question: "How much does ExportRemix cost?",
      answer:
        "We offer three pricing tiers: Free (basic features), Pro ($199/month with advanced AI analysis), and Enterprise ($499/month with unlimited features and priority support). Visit our pricing page for detailed feature comparisons.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take security seriously. All data is encrypted in transit and at rest, we're SOC 2 compliant, and we follow GDPR regulations. Your manifest data is never shared with third parties.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your billing settings. Your access will continue until the end of your current billing period, after which you'll be moved to the Free tier.",
    },
    {
      question: "Do you offer API access?",
      answer:
        "Yes, Pro and Enterprise plans include API access. You can integrate ExportRemix with your existing systems to automate file analysis and compliance checks.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "Free users get email support with 48-hour response time. Pro users get priority email support with 24-hour response. Enterprise users get dedicated support with same-day response and a dedicated account manager.",
    },
    {
      question: "Can I try ExportRemix before purchasing?",
      answer:
        "Yes! Our Free tier allows you to test the platform with basic features. You can upload files, run basic analysis, and explore the dashboard before upgrading to a paid plan.",
    },
    {
      question: "How do I get started?",
      answer:
        "Simply sign up for a free account, upload your first manifest file, and start analyzing. Our onboarding tutorial will guide you through the key features. Upgrade to Pro or Enterprise anytime to unlock advanced features.",
    },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  )
}
