"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8">
        <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 border border-primary/20 rounded-full text-xs sm:text-sm text-primary mb-2 sm:mb-4 backdrop-blur-sm">
          Solving 76% of Supply Chain Disruptions with AI
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance leading-tight px-2 drop-shadow-lg">
          Harmonize Your Exports with{" "}
          <span className="text-primary">
            AI-Powered <span className="inline-block">Remixing</span>
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-2xl mx-auto text-pretty px-2 drop-shadow-md">
          Solve delays, costs (35-60% hikes), and risks for SMEs. Save $10K+ per shipment with AI-powered tariff
          prediction, smart manifest remixing, and export optimization.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-2 sm:pt-4 px-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-11 sm:h-12 text-sm sm:text-base bg-transparent"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 pt-6 sm:pt-8 md:pt-12 max-w-3xl mx-auto">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">76%</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">
              Disruptions Prevented
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">$10K+</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">
              Avg. Savings Per Shipment
            </div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">24/7</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight">
              Real-Time Monitoring
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
