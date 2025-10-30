"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { APIConnector } from "@/components/data/api-connector"
import { Database } from "lucide-react"

export default function ConnectPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Connect APIs</h1>
              <p className="text-muted-foreground mt-1">Connect to logistics data sources for real-time analysis</p>
            </div>
          </div>
        </div>

        <APIConnector />
      </div>
    </DashboardLayout>
  )
}
