"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border/50 p-1 bg-card/50">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="gap-2 h-8 px-2 md:px-3"
      >
        <Sun className="w-4 h-4 text-current" />
        <span className="hidden sm:inline text-xs md:text-sm">Light</span>
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="gap-2 h-8 px-2 md:px-3"
      >
        <Moon className="w-4 h-4 text-current" />
        <span className="hidden sm:inline text-xs md:text-sm">Dark</span>
      </Button>
    </div>
  )
}
