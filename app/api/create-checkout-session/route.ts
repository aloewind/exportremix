import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@supabase/ssr"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover" as any,
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan } = await request.json()

    console.log("[v0] Creating checkout session for plan:", plan, "priceId:", priceId)

    if (!priceId || typeof priceId !== "string") {
      console.error("[v0] Invalid priceId:", priceId)
      return NextResponse.json(
        { error: "Invalid Stripe Price ID. Please configure valid Price IDs in your Stripe Dashboard." },
        { status: 400 },
      )
    }

    // Get user from Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] Unauthorized: No user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.email)

    let customerId: string | undefined

    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (subscriptionData?.stripe_customer_id) {
      customerId = subscriptionData.stripe_customer_id
      console.log("[v0] Using existing Stripe customer:", customerId)
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
      console.log("[v0] Created new Stripe customer:", customerId)

      if (subscriptionData) {
        await supabase.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id)
      } else {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          stripe_customer_id: customerId,
          tier_id: "free",
          status: "incomplete",
        })
      }
    }

    let session
    try {
      session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
          user_id: user.id,
          tier_id: plan,
        },
      })
    } catch (stripeError) {
      console.error("[v0] Stripe API error:", stripeError)
      return NextResponse.json(
        {
          error:
            stripeError instanceof Error
              ? `Stripe error: ${stripeError.message}. Please verify your Stripe Price IDs are correct.`
              : "Failed to create Stripe checkout session",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Checkout session created:", session.id)

    if (!session.url) {
      console.error("[v0] No checkout URL returned from Stripe")
      return NextResponse.json(
        { error: "No checkout URL returned from Stripe. Please check your Stripe configuration." },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 },
    )
  }
}
