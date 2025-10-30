"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, XCircle, AlertCircle, Settings } from "lucide-react"
import { checkEnvVars, getEnvStatusSummary } from "@/lib/env-check"

export function EnvStatusBadge() {
  const [open, setOpen] = useState(false)
  const summary = getEnvStatusSummary()
  const envVars = checkEnvVars()

  const variant = summary.requiredMissing > 0 ? "destructive" : summary.missing > 0 ? "secondary" : "default"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">
            {summary.configured}/{summary.total} Configured
          </span>
          <span className="sm:hidden">
            {summary.configured}/{summary.total}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Environment Variables Status</DialogTitle>
          <DialogDescription>
            {summary.requiredMissing > 0
              ? "Some required variables are missing. The app may not work correctly."
              : summary.missing > 0
                ? "All required variables are configured. Optional features are using fallbacks."
                : "All environment variables are configured!"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {envVars.map((env) => (
            <div key={env.key} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className="mt-0.5">
                {env.present ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : env.required ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{env.name}</p>
                  {env.required && (
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {!env.required && (
                    <Badge variant="secondary" className="text-xs">
                      Optional
                    </Badge>
                  )}
                  {env.present && (
                    <Badge variant="default" className="text-xs">
                      Configured
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{env.description}</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">{env.key}</code>
                {!env.present && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Fallback:</span> {env.fallback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
          <p className="text-sm font-medium">Setup Guide:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Go to Vercel project settings → Environment Variables</li>
            <li>Add missing variables from the list above</li>
            <li>Redeploy your app to apply changes</li>
            <li>For local development, add to .env.local file</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  )
}
