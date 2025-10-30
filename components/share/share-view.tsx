"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Shield, Eye, Calendar } from "lucide-react"

interface ShareViewProps {
  link: {
    id: string
    slug: string
    link_type: string
    data: any
    view_count: number
    created_at: string
    expires_at: string | null
  }
}

export function ShareView({ link }: ShareViewProps) {
  useEffect(() => {
    // Track view
    fetch("/api/shareable/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: link.slug }),
    })
  }, [link.slug])

  const renderContent = () => {
    if (link.link_type === "remix") {
      const data = link.data
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI-Generated Remix</h1>
              <p className="text-sm text-muted-foreground">Shared from ExportRemix</p>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <Badge variant="secondary">{data.type}</Badge>
              <h2 className="text-xl font-bold">{data.title}</h2>
              <p className="text-muted-foreground">{data.description}</p>
            </div>

            {data.recommendations && (
              <div className="space-y-3">
                <h3 className="font-semibold">Recommendations</h3>
                {data.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )
    }

    if (link.link_type === "policy_alert") {
      const data = link.data
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Policy Alert</h1>
              <p className="text-sm text-muted-foreground">Shared from ExportRemix</p>
            </div>
          </div>

          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{data.alert_type}</Badge>
                <Badge variant={data.severity === "high" ? "destructive" : "secondary"}>{data.severity}</Badge>
                <Badge variant="outline">{data.confidence}% confidence</Badge>
              </div>
              <h2 className="text-xl font-bold">{data.title}</h2>
              <p className="text-muted-foreground">{data.description}</p>
              <p className="text-sm text-muted-foreground">Source: {data.source}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Impact</p>
                <p className="text-sm text-muted-foreground">{data.impact}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Recommendation</p>
                <p className="text-sm text-muted-foreground">{data.recommendation}</p>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {renderContent()}

        <Card className="p-4 bg-muted/50">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{link.view_count} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Shared {new Date(link.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button size="sm" asChild>
              <a href="/">Try ExportRemix</a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
