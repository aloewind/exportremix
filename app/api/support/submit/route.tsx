import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { error } = await supabase.from("support_requests").insert({
      name,
      email,
      subject,
      message,
      status: "open",
    })

    if (error) throw error

    try {
      const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || "aloewind@yahoo.com"

      // Send email using Resend API
      const resendApiKey = process.env.RESEND_API_KEY

      if (resendApiKey) {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "ExportRemix Support <onboarding@resend.dev>",
            to: [ownerEmail],
            reply_to: email,
            subject: `[ExportRemix Support] ${subject}`,
            html: `
              <h2>New Support Request</h2>
              <p><strong>From:</strong> ${name} (${email})</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p>${message.replace(/\n/g, "<br>")}</p>
              <hr>
              <p><small>This message was sent from the ExportRemix contact form.</small></p>
            `,
          }),
        })

        if (emailResponse.ok) {
          console.log(`[v0] Support request email sent to ${ownerEmail}`)
        } else {
          console.error("[v0] Failed to send email:", await emailResponse.text())
        }
      } else {
        console.log(
          `[v0] Support request saved to database. Email would be sent to ${ownerEmail} if RESEND_API_KEY was configured.`,
        )
      }
    } catch (emailError) {
      console.error("[v0] Email sending error:", emailError)
      // Don't fail the request if email fails - the data is still saved
    }

    return NextResponse.json({
      success: true,
      message: "Support request submitted successfully. We'll respond via email within 24 hours.",
    })
  } catch (error) {
    console.error("[v0] Support submission error:", error)
    return NextResponse.json({ error: "Failed to submit support request" }, { status: 500 })
  }
}
