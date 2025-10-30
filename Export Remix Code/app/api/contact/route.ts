import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { error: dbError } = await supabase.from("support_requests").insert({
      name,
      email,
      subject: "Contact Form Submission",
      message,
      status: "pending",
    })

    if (dbError) {
      console.error("[v0] Failed to save to database:", dbError)
      // Continue to send email even if database save fails
    }

    // Send email notification
    await resend.emails.send({
      from: "ExportRemix <noreply@exportremix.com>",
      to: process.env.NEXT_PUBLIC_OWNER_EMAIL || "support@exportremix.com",
      replyTo: email,
      subject: `Contact Form: ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
