import { Card } from "@/components/ui/card"
import { Mail, MessageSquare, HelpCircle } from "lucide-react"
import { ContactForm } from "@/components/contact/contact-form"
import { FAQSection } from "@/components/contact/faq-section"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Contact Us - ExportRemix",
  description: "Get in touch with the ExportRemix team for support, questions, or feedback.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Have questions or need help? We're here to assist you with your supply chain needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Send us a message</h2>
              <ContactForm />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Other ways to reach us</h2>

              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@exportremix.com</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Response within 24 hours during business days</p>
              </Card>

              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Support Center</h3>
                    <p className="text-sm text-muted-foreground">Browse help articles</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Feedback</h3>
                    <p className="text-sm text-muted-foreground">feedback@exportremix.com</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <FAQSection />
          </div>
        </div>
      </div>
    </div>
  )
}
