import path from "node:path";
import type { NextConfig } from "next";

/**
 * Host-agnostic on purpose: the deploy target is not settled, and the likely
 * one is Cloudflare.
 *
 * - `images.unoptimized` keeps next/image working without a platform image
 *   service. Every image the page ships is already right-sized (WebP tour
 *   frames, a JPEG poster, two small PNG logos), so the optimiser would have
 *   nothing left to do and would only add a hosting dependency.
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
    return [
      {
        // Tour frames are content-addressed by the build: a rebuild is a new
        // commit, and a given URL never changes contents mid-deploy. Cache
        // them forever so only the very first visit pays for the film.
        // Localhost never surfaced this because disk reads need no cache.
        source: "/media/tour/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Deliberately NOT /media/:path*, which would also match the tour and,
        // being the later rule, would quietly override the immutable header
        // above with a thirty-day one.
        source: "/media/stills/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
      },
      {
        source: "/brand/:path*",
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
  },
};

export default nextConfig;
