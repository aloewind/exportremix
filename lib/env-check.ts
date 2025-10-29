/**
 * Environment Variables Utility
 *
 * This utility checks for required environment variables and provides
 * graceful fallbacks when they are missing. The app works in "keyless mode"
 * with realistic mocks when no API keys are configured.
 *
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (for database/auth)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key (for client-side access)
 * - SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (for server-side admin access)
 *
 * Optional Environment Variables (app works without these):
 * - OPENAI_API_KEY: OpenAI API key (falls back to mock predictions)
 * - STRIPE_SECRET_KEY: Stripe secret key (disables billing features)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Stripe publishable key (disables checkout)
 * - WTO_API_KEY: WTO API key (uses public World Bank WITS API)
 * - NEXT_PUBLIC_APP_URL: App URL for redirects (defaults to localhost)
 *
 * Setup Guide:
 * 1. Copy .env.example to .env.local
 * 2. Add your Supabase credentials (required)
 * 3. Optionally add OpenAI, Stripe keys for full features
 * 4. Deploy to Vercel and add env vars in project settings
 */

export interface EnvStatus {
  name: string
  key: string
  required: boolean
  present: boolean
  description: string
  fallback: string
}

export function checkEnvVars(): EnvStatus[] {
  return [
    {
      name: "Supabase URL",
      key: "NEXT_PUBLIC_SUPABASE_URL",
      required: true,
      present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      description: "Database and authentication",
      fallback: "App will not work without Supabase",
    },
    {
      name: "Supabase Anon Key",
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      required: true,
      present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      description: "Client-side database access",
      fallback: "App will not work without Supabase",
    },
    {
      name: "OpenAI API",
      key: "OPENAI_API_KEY",
      required: false,
      present: !!process.env.OPENAI_API_KEY,
      description: "AI predictions and remixing",
      fallback: "Using realistic mock predictions",
    },
    {
      name: "Stripe Secret",
      key: "STRIPE_SECRET_KEY",
      required: false,
      present: !!process.env.STRIPE_SECRET_KEY,
      description: "Payment processing",
      fallback: "Billing features disabled",
    },
    {
      name: "Stripe Publishable",
      key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      required: false,
      present: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      description: "Checkout UI",
      fallback: "Billing features disabled",
    },
    {
      name: "App URL",
      key: "NEXT_PUBLIC_APP_URL",
      required: false,
      present: !!process.env.NEXT_PUBLIC_APP_URL,
      description: "OAuth redirects",
      fallback: "Using localhost for development",
    },
  ]
}

export function getMissingRequiredVars(): EnvStatus[] {
  return checkEnvVars().filter((env) => env.required && !env.present)
}

export function getMissingOptionalVars(): EnvStatus[] {
  return checkEnvVars().filter((env) => !env.required && !env.present)
}

export function hasAllRequiredVars(): boolean {
  return getMissingRequiredVars().length === 0
}

export function getEnvStatusSummary(): {
  total: number
  configured: number
  missing: number
  requiredMissing: number
} {
  const all = checkEnvVars()
  const configured = all.filter((env) => env.present)
  const missing = all.filter((env) => !env.present)
  const requiredMissing = missing.filter((env) => env.required)

  return {
    total: all.length,
    configured: configured.length,
    missing: missing.length,
    requiredMissing: requiredMissing.length,
  }
}
