import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/site";

/**
 * One page, so one entry. The section anchors are not listed: a fragment is not
 * a separate URL, and listing them invites duplicate-content warnings for
 * nothing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
