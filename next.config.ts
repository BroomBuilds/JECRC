import path from "node:path";
import type { NextConfig } from "next";

/**
 * Host-agnostic on purpose: the deploy target is not settled, and the likely
 * one is Cloudflare.
 *
 * - `images.unoptimized` keeps next/image working without a platform image
 *   service. Every image the page ships is WebP and already right-sized —
 *   `npm run media` is what makes that true — so the optimiser would have
 *   nothing left to do and would only add a hosting dependency. The four PNGs
 *   left at the root are favicons and the Open Graph card, which are read by
 *   other people's software and never go through next/image at all.
 * - `headers()` covers Node-served hosts. Cloudflare Pages and Workers read
 *   `public/_headers` instead, so the same rules are written there too. Keep
 *   the two in step.
 */
const nextConfig: NextConfig = {
  // Pinned, otherwise Turbopack walks up past the repo looking for a lockfile
  // and picks one out of the home directory.
  turbopack: { root: path.resolve(".") },

  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },

  async headers() {
    // Order matters and is load-bearing: where two rules match the same
    // request, the LATER one wins. Broad rules first, exceptions after.
    return [
      {
        // Everything the page ships out of /media that is not the film:
        // photographs, recruiter marks, the medical renders, the scratch
        // board. Replaced by editing the file rather than by minting a new
        // URL, so a month rather than a year.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        // The film. Content-addressed by the build: a rebuild is a new commit,
        // and a given URL never changes contents mid-deploy. Cache it forever
        // so only the very first visit pays for it. After /media/:path* on
        // purpose — as the later rule it is the one that applies. Localhost
        // never surfaced any of this because disk reads need no cache.
        source: "/media/tour/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        // Icons and the social card, which live at the root. Fetched by other
        // people's crawlers as much as by browsers, and neither re-fetches
        // often.
        source: "/:file(.*\.(?:png|ico))",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  }
};

export default nextConfig;
