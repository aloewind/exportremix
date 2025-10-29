import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://manifest-flow-weaver.vercel.app"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/support"],
        disallow: ["/dashboard", "/api", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
