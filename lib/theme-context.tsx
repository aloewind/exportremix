"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("theme") as Theme | null

    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setThemeState(systemTheme)
      applyTheme(systemTheme)
    }

    // Load theme from Supabase profile if logged in
    const loadUserTheme = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("theme_preference")
            .eq("id", user.id)
            .single()

          if (
            profile?.theme_preference &&
            (profile.theme_preference === "light" || profile.theme_preference === "dark")
          ) {
            const userTheme = profile.theme_preference as Theme
            setThemeState(userTheme)
            applyTheme(userTheme)
            localStorage.setItem("theme", userTheme)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to load user theme:", error)
      }
    }

    loadUserTheme()
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
    }
  }

  const setTheme = async (newTheme: Theme) => {
    console.log("[v0] Setting theme to:", newTheme)
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    // Save to Supabase profile if logged in (non-blocking)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("profiles").update({ theme_preference: newTheme }).eq("id", user.id)
      }
    } catch (error) {
      console.error("[v0] Failed to save theme to profile:", error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
