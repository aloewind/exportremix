"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">You're Offline</h1>
          <p className="text-muted-foreground">
            No internet connection detected. Some features may be limited until you reconnect.
          </p>
        </div>
        <div className="space-y-3">
          <Button className="w-full gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full bg-transparent">
              Go to Dashboard
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Offline mode uses cached data and mock predictions. Your changes will sync when you reconnect.
        </p>
      </Card>
    </div>
  )
}
