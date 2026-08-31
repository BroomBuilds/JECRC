import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/site";

/**
 * Answer engines are allowed in on purpose, and named rather than left to the
 * wildcard.
 *
 * The whole GEO argument for this page is that its facts get quoted correctly.
 * That cannot happen behind a disallow, and several of these crawlers are
 * conservative: `Google-Extended` and `Applebot-Extended` are opt-outs that
 * some hosts and CDNs add by default, so saying yes explicitly is the only way
 * to be sure the answer is yes.
 *
 * Only the build output is fenced off.
 */

/** Named because a wildcard is not an answer some of these will accept. */
const ANSWER_ENGINES = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "DuckDuckBot",
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/_next/static/chunks/"] },
      ...ANSWER_ENGINES.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
