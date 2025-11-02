import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[v0] Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createServerClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tierId = session.metadata?.tier_id

        if (userId && session.subscription) {
          // stripe.subscriptions.retrieve returns Stripe.Response<Stripe.Subscription>
          // cast to Stripe.Subscription to access current_period_start and current_period_end
          const sub = (await stripe.subscriptions.retrieve(session.subscription as string)) as unknown as Stripe.Subscription
          const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null
          const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: sub.id,
              stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
              tier: tierId || "pro",
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

          if (tierId === "enterprise") {
            console.log("[v0] Granting admin role to Enterprise subscriber:", userId)
            await supabase
              .from("profiles")
              .update({
                role: "admin",
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)

            console.log("[v0] Admin role granted successfully")
          }
        }
        break
      }

      case "customer.subscription.created": {
        // event.data.object may be typed loosely; assert as Stripe.Subscription
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          const userId = profile.id
          const tierId = sub.metadata?.tier_id

          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: sub.id,
              stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
              tier: tierId || "pro",
              status: "active",
              current_period_start: periodStart,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null
        const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null

        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id, tier")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSub) {
          await supabase
            .from("subscriptions")
            .update({
              status: sub.status === "active" ? "active" : sub.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id)

          if (sub.status !== "active" && existingSub.tier === "enterprise") {
            console.log("[v0] Revoking admin role due to subscription change:", existingSub.user_id)
            await supabase
              .from("profiles")
              .update({
                role: "user",
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingSub.user_id)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id, tier")
          .eq("stripe_customer_id", customerId)
          .single()

        if (existingSub) {
          if (existingSub.tier === "enterprise") {
            console.log("[v0] Revoking admin role due to subscription deletion:", existingSub.user_id)
            await supabase
              .from("profiles")
              .update({
                role: "user",
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingSub.user_id)
          }

          await supabase
            .from("subscriptions")
            .update({
              tier: "free",
              status: "canceled",
              stripe_subscription_id: null,
              stripe_price_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", existingSub.user_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}