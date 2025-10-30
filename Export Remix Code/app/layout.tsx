import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Fira_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { Footer } from "@/components/layout/footer"
import { GlobalNav } from "@/components/layout/global-nav"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const firaMono = Fira_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ExportRemix: AI Tariff Prediction & Manifest Remixing for Logistics Disruptions",
  description:
    "Overcome 76% supply chain disruptions with ExportRemix – AI tools for tariff surge detection, smart manifest remixing, and export optimization. Save $10K+ per shipment. Free trial available.",
  keywords: [
    "AI tariff prediction",
    "manifest remixing",
    "logistics disruption tools",
    "supply chain AI",
    "export optimization",
    "tariff surges",
    "predictive tariff surges",
    "vibe tariff app",
    "customs manifest automation",
    "export harmonization",
    "logistics intelligence",
    "WTO policy monitoring",
    "trade compliance",
    "supply chain disruption prevention",
    "smart manifest fixer",
    "AI manifest optimization",
    "harmonized tariff data",
  ],
  authors: [{ name: "ExportRemix" }],
  creator: "ExportRemix",
  publisher: "ExportRemix",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://exportremix.vercel.app",
    title: "ExportRemix: AI Tariff Prediction & Manifest Remixing for Logistics Disruptions",
    description:
      "Overcome 76% supply chain disruptions with ExportRemix – AI tools for tariff surge detection, smart manifest remixing, and export optimization. Save $10K+ per shipment.",
    siteName: "ExportRemix",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ExportRemix - AI-powered logistics and supply chain optimization platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ExportRemix: AI Tariff Prediction & Manifest Remixing",
    description:
      "Overcome 76% supply chain disruptions with AI tools for tariff surge detection and export optimization. Save $10K+ per shipment.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ExportRemix",
  },
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${firaMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <Suspense fallback={null}>
            <div className="flex flex-col min-h-screen">
              <GlobalNav />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <Analytics />
            <Toaster />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
