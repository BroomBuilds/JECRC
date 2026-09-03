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
        // THE DOCUMENT. Revalidate on every visit.
        //
        // This is the rule the whole cache-busting scheme hangs off. Left to
        // itself Next serves a static page as `s-maxage=31536000` with no
        // `max-age` at all, which pins the HTML in the CDN for a year and
        // leaves browsers to guess. The ?v= fingerprint on the tour frames is
        // minted at build time and lives in the HTML and the bundle it points
        // at, so a visitor holding last month's document asks for last month's
        // frames and no amount of fingerprinting reaches them. Busting the
        // assets is worth nothing while the thing that names them is stale.
        //
        // max-age=0 against an ETag is not a re-download: it is a conditional
        // request that comes back 304 with no body on every visit but the one
        // that matters.
        //
        // First rather than last, so the asset rules below override this one
        // header and still inherit the security ones.
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Next's own output, whose filenames carry a content hash: a change is
        // a new URL, so this can be cached hard. Stated explicitly because the
        // catch-all above would otherwise drag it down to revalidate-always and
        // charge a conditional request per chunk on every navigation.
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Everything the page ships out of /media that is not the film:
        // photographs, recruiter marks, the medical renders, the scratch
        // board. Replaced by editing the file rather than by minting a new
        // URL, so a month rather than a year.
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        // The film. Frame paths repeat build to build, so what makes this
        // immutable is the ?v= fingerprint every frame URL carries — see
        // scripts/tour-rev.mjs. Without it a phone keeps the cut it first saw
        // for a year and no deploy can reach it. After /media/:path* on
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
    ];
  }
};

export default nextConfig;
