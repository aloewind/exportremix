import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    const paymentMethods: Stripe.ApiList<Stripe.PaymentMethod> = await stripe.paymentMethods.list({
      customer: subscription.stripe_customer_id,
      type: "card",
      limit: 10,
    })

    const sanitizedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand ?? "unknown",
      last4: pm.card?.last4 ?? "****",
      exp_month: pm.card?.exp_month ?? 0,
      exp_year: pm.card?.exp_year ?? 0,
    }))

    return NextResponse.json({ paymentMethods: sanitizedMethods })
  } catch (error) {
    console.error("[payment-methods] Error:", error)
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 })
  }
}
