import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Privacy Policy - ExportRemix",
  description:
    "Learn how ExportRemix handles your data with GDPR compliance, local processing, and transparent use of public APIs.",
}

export default async function PrivacyPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-card/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/logo.png"
                alt="ExportRemix"
                width={36}
                height={36}
                className="rounded-lg w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 flex-shrink-0"
              />
              <span className="font-bold text-lg sm:text-xl md:text-2xl text-foreground">ExportRemix</span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <ThemeToggle />
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                About
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                Support
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">
              <Shield className="w-4 h-4" />
              GDPR Compliant
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            <p className="text-base text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-card border border-primary/20 rounded-lg p-5 space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Privacy at a Glance
            </h2>
            <p className="text-muted-foreground text-sm">
              Your manifests are processed locally; APIs are public – no hidden fees or risks. We use public APIs like
              CBP, WTO, and USITC for predictions. No personally identifiable information (PII) is stored without your
              explicit consent.
            </p>
          </div>

          {/* Data Collection */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Data Collection
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We collect and process the following types of data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account Information:</strong> Email address, name, and authentication credentials when you
                  create an account
                </li>
                <li>
                  <strong>Manifest Data:</strong> CSV/JSON files you upload for analysis (processed locally and not
                  permanently stored without consent)
                </li>
                <li>
                  <strong>Usage Analytics:</strong> Login times, feature usage, and interaction patterns to improve our
                  service
                </li>
                <li>
                  <strong>API Interactions:</strong> Requests to public APIs (CBP, WTO, USITC) for tariff and policy
                  data
                </li>
                <li>
                  <strong>Feedback:</strong> Ratings and comments you provide to help us improve
                </li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary" />
              How We Use Your Data
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Your data is used exclusively for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>AI Predictions:</strong> Analyzing your manifest data to detect tariff surges and supply chain
                  disruptions
                </li>
                <li>
                  <strong>Remix Functionality:</strong> Processing your conversational prompts to generate customized
                  data visualizations
                </li>
                <li>
                  <strong>Policy Monitoring:</strong> Fetching real-time data from public APIs (WTO, CBP, USITC) to
                  alert you of policy changes
                </li>
                <li>
                  <strong>Service Improvement:</strong> Analyzing usage patterns to enhance features and user experience
                </li>
                <li>
                  <strong>Communication:</strong> Sending surge alerts and important updates (only if you opt-in)
                </li>
              </ul>
              <p className="pt-2">
                <strong>Important:</strong> Your manifest data is processed in real-time and not permanently stored on
                our servers unless you explicitly save it. All AI processing happens securely with industry-standard
                encryption.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Data Security
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We implement robust security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)
                </li>
                <li>
                  <strong>Authentication:</strong> Secure authentication via Supabase with optional Google OAuth
                </li>
                <li>
                  <strong>Access Control:</strong> Role-based access with admin-only features protected by database
                  policies
                </li>
                <li>
                  <strong>Public APIs Only:</strong> We use publicly available APIs (CBP, WTO, USITC) – no proprietary
                  or sensitive data sources
                </li>
                <li>
                  <strong>Regular Audits:</strong> Continuous monitoring and security updates to protect against
                  vulnerabilities
                </li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Third-Party Services</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We integrate with the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Supabase:</strong> Database and authentication (GDPR compliant)
                </li>
                <li>
                  <strong>OpenAI:</strong> AI-powered predictions and remixing (data not used for training)
                </li>
                <li>
                  <strong>Stripe:</strong> Payment processing for Pro subscriptions (PCI DSS compliant)
                </li>
                <li>
                  <strong>Resend:</strong> Email delivery for surge alerts (opt-in only)
                </li>
                <li>
                  <strong>Public APIs:</strong> WTO, CBP, USITC for tariff and policy data (publicly available
                  information)
                </li>
              </ul>
              <p className="pt-2">
                These services have their own privacy policies and comply with international data protection
                regulations.
              </p>
            </div>
          </section>

          {/* GDPR Compliance */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">GDPR Compliance & Your Rights</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>Under GDPR, you have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Right to Access:</strong> Request a copy of all data we hold about you
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Correct any inaccurate or incomplete data
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your account and all associated data
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Export your data in a machine-readable format
                </li>
                <li>
                  <strong>Right to Object:</strong> Opt-out of email alerts and analytics tracking
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Revoke consent for data processing at any time
                </li>
              </ul>
              <p className="pt-2">
                To exercise any of these rights, please contact us at{" "}
                <a href="mailto:privacy@manifestflowweaver.com" className="text-primary hover:underline">
                  privacy@manifestflowweaver.com
                </a>
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Retention</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We retain your data for the following periods:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Account Data:</strong> Retained until you delete your account
                </li>
                <li>
                  <strong>Manifest Data:</strong> Processed in real-time and not permanently stored (unless you save it)
                </li>
                <li>
                  <strong>Usage Analytics:</strong> Aggregated and anonymized after 90 days
                </li>
                <li>
                  <strong>Billing Records:</strong> Retained for 7 years for tax compliance (Stripe handles this)
                </li>
              </ul>
              <p className="pt-2">
                When you delete your account, all personal data is permanently removed within 30 days, except where
                required by law.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Cookies & Tracking</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>We use minimal cookies for essential functionality:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Authentication Cookies:</strong> To keep you logged in (required)
                </li>
                <li>
                  <strong>Session Cookies:</strong> To maintain your preferences during your visit (required)
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> To understand usage patterns (optional, can be disabled)
                </li>
              </ul>
              <p className="pt-2">We do not use third-party advertising or tracking cookies.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Contact Us
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>If you have any questions or concerns about our privacy practices, please contact us:</p>
              <div className="bg-card border border-border rounded-lg p-4 space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@manifestflowweaver.com" className="text-primary hover:underline">
                    privacy@manifestflowweaver.com
                  </a>
                </p>
                <p>
                  <strong>Support:</strong>{" "}
                  <Link href="/support" className="text-primary hover:underline">
                    Visit our Support page
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Policy Updates</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                requirements. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on this page with a new "Last updated" date</li>
                <li>Sending an email notification to your registered email address</li>
                <li>Displaying a prominent notice on the dashboard</li>
              </ul>
              <p className="pt-2">
                Your continued use of ExportRemix after any changes constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-card border border-primary/20 rounded-lg p-6 text-center space-y-4">
            <h3 className="text-xl font-semibold">Questions About Privacy?</h3>
            <p className="text-muted-foreground">
              We're committed to transparency and protecting your data. Contact us anytime for clarification.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/support">
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Mail className="w-4 h-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="gap-2">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
