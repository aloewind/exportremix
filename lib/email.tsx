// This file provides mock functions for backward compatibility

export interface SurgeAlertEmailData {
  userName: string
  alertTitle: string
  alertDescription: string
  severity: string
  confidence: number
  impact: string
  recommendation: string
  dashboardUrl: string
}

export interface SupportFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendSurgeAlertEmail(to: string, data: SurgeAlertEmailData) {
  console.log("[v0] Mock mode: Alert notification would be shown in-app", {
    to,
    alert: data.alertTitle,
  })

  // Return success - actual notification is handled by the dashboard
  return {
    success: true,
    emailId: "mock-" + Date.now(),
    mode: "in-app-notification",
  }
}

export async function sendSupportFormEmail(data: SupportFormData) {
  console.log("[v0] Mock mode: Support request saved to database", {
    from: data.email,
    subject: data.subject,
  })

  // Return success - request is saved to database
  return {
    success: true,
    emailId: "mock-" + Date.now(),
    mode: "database-only",
  }
}
