import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/site";

/**
 * Answer engines are allowed in deliberately. The whole GEO argument for this
 * page is that its facts get quoted correctly, which cannot happen behind a
 * disallow. Only the Next.js build output is fenced off.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/_next/static/chunks/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
