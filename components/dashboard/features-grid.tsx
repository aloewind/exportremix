"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sparkles,
  TrendingUp,
  Shield,
  Bell,
  BarChart3,
  Database,
  Zap,
  Globe,
  Lock,
  Crown,
  Users,
  CheckCircle2,
  UserCog,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  tier: "free" | "pro" | "enterprise"
  tooltip: string
  available: boolean
  link?: string
}

interface FeaturesGridProps {
  userTier: "free" | "pro" | "enterprise"
}

export function FeaturesGrid({ userTier }: FeaturesGridProps) {
  const router = useRouter()

  const features: Feature[] = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Manifest Remixing",
      description: "Intelligent manifest optimization",
      tier: "free",
      tooltip:
        "AI-powered manifest rewriting for compliance and cost savings. Free tier: 10/month, Pro: 100/month, Enterprise: Unlimited",
      available: true,
      link: "/dashboard/remix",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Tariff Surge Prediction",
      description: "Real-time tariff forecasting",
      tier: "free",
      tooltip:
        "Predict tariff surges before they happen. Free tier: Basic predictions, Pro: Advanced ML models, Enterprise: Custom models",
      available: true,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Policy Sentinel",
      description: "Compliance checking & alerts",
      tier: "free",
      tooltip:
        "Automated compliance monitoring for export regulations. Free tier: Basic checks, Pro: Real-time monitoring, Enterprise: Custom rules",
      available: true,
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Alerts",
      description: "Proactive notifications",
      tier: "pro",
      tooltip:
        "Get notified of disruptions, surges, and opportunities. Pro: Email + SMS alerts, Enterprise: Custom webhooks",
      available: userTier === "pro" || userTier === "enterprise",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Advanced Analytics",
      description: "Deep insights & reporting",
      tier: "pro",
      tooltip:
        "Comprehensive analytics dashboard with cost optimization metrics. Pro: Standard reports, Enterprise: Custom dashboards",
      available: userTier === "pro" || userTier === "enterprise",
      link: "/dashboard/analytics",
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "API Integration",
      description: "Connect your systems",
      tier: "pro",
      tooltip:
        "Full REST API access to integrate ExportRemix with your existing tools. Pro: 1000 calls/day, Enterprise: Unlimited",
      available: userTier === "pro" || userTier === "enterprise",
      link: "/dashboard/integrations",
    },
    {
      icon: <UserCog className="w-5 h-5" />,
      title: "User Roles Management",
      description: "Manage team permissions & access",
      tier: "enterprise",
      tooltip:
        "Control user access with granular role-based permissions. Assign Admin, Manager, or User roles to team members. Admins can manage all users and view analytics, Managers can edit API integrations, and Users have basic access. Enterprise only feature.",
      available: userTier === "enterprise",
      link: "/dashboard/admin",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Real-time Processing",
      description: "Instant manifest analysis",
      tier: "enterprise",
      tooltip:
        "Process manifests in real-time with priority queue. Pro: 5-second response, Enterprise: Sub-second with dedicated resources",
      available: userTier === "enterprise",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Multi-region Support",
      description: "Global trade coverage",
      tier: "enterprise",
      tooltip: "Support for all major trade routes and customs regulations worldwide. Enterprise only feature",
      available: userTier === "enterprise",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Team Collaboration",
      description: "Multi-user workspace",
      tier: "enterprise",
      tooltip:
        "Invite team members, assign roles, and collaborate on manifests. Enterprise: Unlimited users with granular permissions",
      available: userTier === "enterprise",
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Custom Security",
      description: "Enterprise-grade protection",
      tier: "enterprise",
      tooltip: "SOC 2 compliance, custom data retention, and dedicated security team. Enterprise only",
      available: userTier === "enterprise",
    },
  ]

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "free":
        return (
          <Badge variant="outline" className="text-xs">
            Free
          </Badge>
        )
      case "pro":
        return (
          <Badge variant="default" className="text-xs gap-1">
            <Crown className="w-3 h-3" />
            Pro
          </Badge>
        )
      case "enterprise":
        return (
          <Badge variant="secondary" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            Enterprise
          </Badge>
        )
    }
  }

  const handleFeatureClick = (feature: Feature) => {
    if (feature.available && feature.link) {
      router.push(feature.link)
    }
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card
                className={`p-4 transition-all hover:shadow-lg ${
                  feature.available && feature.link ? "cursor-pointer" : "cursor-default"
                } ${feature.available ? "hover:border-primary/50" : "opacity-60 hover:opacity-80"}`}
                onClick={() => handleFeatureClick(feature)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2 rounded-lg ${
                      feature.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {getTierBadge(feature.tier)}
                    {feature.available && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                {!feature.available && <p className="text-xs text-primary mt-2">Upgrade to unlock</p>}
                {feature.available && feature.link && <p className="text-xs text-primary/70 mt-2">Click to access →</p>}
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{feature.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
