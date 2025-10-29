"use client"

import { useEffect, useState } from "react"
import { en, type Translations } from "@/lib/translations/en"
import { es } from "@/lib/translations/es"

const translations: Record<string, Translations> = {
  en,
  es,
}

export function useTranslations(): Translations {
  const [locale, setLocale] = useState<string>("en")
  const [t, setT] = useState<Translations>(en)

  useEffect(() => {
    // Get locale from cookie
    const getLocaleFromCookie = () => {
      const cookies = document.cookie.split("; ")
      const localeCookie = cookies.find((c) => c.startsWith("NEXT_LOCALE="))
      return localeCookie ? localeCookie.split("=")[1] : "en"
    }

    const currentLocale = getLocaleFromCookie()
    setLocale(currentLocale)
    setT(translations[currentLocale] || en)

    // Listen for locale changes
    const handleLocaleChange = () => {
      const newLocale = getLocaleFromCookie()
      if (newLocale !== locale) {
        setLocale(newLocale)
        setT(translations[newLocale] || en)
      }
    }

    // Check for locale changes every second
    const interval = setInterval(handleLocaleChange, 1000)

    return () => clearInterval(interval)
  }, [locale])

  return t
}
