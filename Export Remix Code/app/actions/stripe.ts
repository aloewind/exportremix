"use server"

import { headers } from "next/headers"
import { stripe, SUBSCRIPTION_TIERS } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function startCheckoutSession(tierId: string) {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
  if (!tier || tier.id === "free") {
    throw new Error(`Invalid tier: ${tierId}`)
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    await supabase.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id)
  }

  const headersList = await headers()
  const origin = headersList.get("origin") || "http://localhost:3000"

  // Create checkout session for subscription
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: tier.name,
            description: tier.description,
          },
          unit_amount: tier.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/billing?canceled=true`,
    metadata: {
      user_id: user.id,
      tier_id: tier.id,
    },
  })

  if (!session.url) {
    throw new Error("Failed to create checkout session")
  }

  redirect(session.url)
}

export async function createPortalSession() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error("No Stripe customer found")
  }

  const headersList = await headers()
  const origin = headersList.get("origin") || "http://localhost:3000"

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${origin}/dashboard/billing`,
  })

  redirect(session.url)
}

export async function startPublicCheckoutSession(tierId: string) {
  const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
  if (!tier || tier.id === "free") {
    throw new Error(`Invalid tier: ${tierId}`)
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, redirect to signup with plan parameter
  if (!user) {
    redirect(`/signup?plan=${tierId}`)
  }

  // If authenticated, proceed with checkout
  return startCheckoutSession(tierId)
}
