"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Globe } from "lucide-react"
import { setLocale } from "@/lib/i18n-utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LanguageSelectorProps {
  currentLocale: string
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {
  const [locale, setLocaleState] = useState(currentLocale)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await setLocale(locale)
      toast({
        title: locale === "en" ? "Language Updated" : "Idioma Actualizado",
        description:
          locale === "en" ? "Your language preference has been saved." : "Tu preferencia de idioma ha sido guardada.",
      })
      // Refresh to apply new locale
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update language preference",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">{currentLocale === "en" ? "Language" : "Idioma"}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {currentLocale === "en"
            ? "Choose your preferred language for the interface"
            : "Elige tu idioma preferido para la interfaz"}
        </p>
      </div>

      <RadioGroup value={locale} onValueChange={setLocaleState}>
        <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en" className="flex-1 cursor-pointer">
            <div className="space-y-1">
              <p className="font-medium">English</p>
              <p className="text-sm text-muted-foreground">United States</p>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
          <RadioGroupItem value="es" id="es" />
          <Label htmlFor="es" className="flex-1 cursor-pointer">
            <div className="space-y-1">
              <p className="font-medium">Español</p>
              <p className="text-sm text-muted-foreground">Spanish</p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      <Button onClick={handleSave} disabled={isLoading || locale === currentLocale}>
        {isLoading
          ? currentLocale === "en"
            ? "Saving..."
            : "Guardando..."
          : currentLocale === "en"
            ? "Save Language"
            : "Guardar Idioma"}
      </Button>
    </div>
  )
}
