"use server"

import { cookies } from "next/headers"

export async function setLocale(locale: string) {
  const cookieStore = await cookies()
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

export async function getLocale() {
  const cookieStore = await cookies()
  return cookieStore.get("NEXT_LOCALE")?.value || "en"
}
