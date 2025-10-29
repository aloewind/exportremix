"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Back Online", {
        description: "Connection restored. Syncing data...",
        icon: <Wifi className="w-4 h-4" />,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("Offline Mode", {
        description: "Using cached data and mock predictions",
        icon: <WifiOff className="w-4 h-4" />,
        duration: 5000,
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return null
}
