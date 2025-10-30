import "server-only"

import Stripe from "stripe"

export { SUBSCRIPTION_TIERS, type SubscriptionTier } from "./subscription-tiers"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover" as any,
})
