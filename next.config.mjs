import path from "node:path";

/**
 * Deployed on Hostinger.
 *
 * Plain `.mjs`, not `.ts`, on purpose. A TypeScript config has to be compiled
 * to a temporary file and imported back before anything else can run, and on a
 * host whose Node is older than Next needs — or whose project root is not
 * writable — that import fails with a message about a `<hash>.next.config`
 * file that does not exist in the repo. This file needs no build step, so that
 * failure cannot happen.
 *
 * - `images.unoptimized` keeps next/image working without a platform image
 *   service. Every image the page ships is WebP and already right-sized —
 *   `npm run media` is what makes that true — so the optimiser would have
 *   nothing left to do and would only add a hosting dependency. The four PNGs
 *   at the root are favicons and the Open Graph card, read by other people's
 *   software and never passed through next/image.
 * - `headers()` below is what a Node host applies. Served as static files
 *   instead, Apache and LiteSpeed read `public/.htaccess`, which carries the
 *   same rules. Keep the two in step.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pinned, otherwise Turbopack walks up past the repo looking for a lockfile
  // and picks one out of the home directory.
  turbopack: { root: path.resolve(".") },

  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },

  async headers() {
    // HEADERS ARE APPENDED, NOT OVERRIDDEN. This block used to claim that the
    // later of two matching rules wins. It does not: Next emits every matching
    // rule's headers, so three rules matching one frame produced
    //
    //   cache-control: public, max-age=0, must-revalidate, public,
    //                  max-age=2592000, public, max-age=31536000, immutable
    //
    // and browsers reading a duplicated max-age take the FIRST, so every frame
    // of the film is revalidated on every visit.
    //
    // The fix is not ordering. It is writing Cache-Control EXACTLY ONCE per
    // request: the catch-all carries security headers and no Cache-Control, and
    // every path that needs one names it itself, with no two rules overlapping.
    // `:file` matches one segment, `:path*` matches a whole subtree — which is
    // why the loose files in /media are matched by the former and the film,
    // living deeper, is not.
    const asset = (source, value) => ({
      source,
      headers: [{ key: "Cache-Control", value }],
    });
    const YEAR = "public, max-age=31536000, immutable";
    const MONTH = "public, max-age=2592000";
    const REVALIDATE = "public, max-age=0, must-revalidate";

    return [
      {
        // Security headers only. No Cache-Control here, ever — that is what
        // leaked onto every asset on the site.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },

      // THE DOCUMENT. Revalidate on every visit.
      //
      // The rule the cache-busting scheme hangs off. Left alone Next serves a
      // static page as `s-maxage=31536000` with no `max-age` at all, which pins
      // the HTML in the CDN for a year and leaves browsers to guess. The ?v=
      // fingerprint on the tour frames is minted at build time and lives in the
      // HTML and the bundle it points at, so a visitor holding last month's
      // document asks for last month's frames and no amount of fingerprinting
      // reaches them. Busting the assets is worth nothing while the thing that
      // names them is stale.
      //
      // max-age=0 against an ETag is not a re-download: it is a conditional
      // request that comes back 304 with no body on every visit but the one
      // that matters.
      asset("/", REVALIDATE),
      asset("/index.html", REVALIDATE),

      // THE FILM. Frame paths repeat build to build, so what makes this
      // immutable is the ?v= fingerprint every frame URL carries — see
      // scripts/tour-rev.mjs. Without it a phone keeps the cut it first saw for
      // a year and no deploy can reach it.
      asset("/media/tour/:path*", YEAR),

      // The rest of /media: photographs, recruiter marks, the medical renders,
      // the scratch board. Replaced by editing the file rather than by minting
      // a new URL, so a month rather than a year. `/media/:file` matches only
      // the loose files sitting directly in /media; anything deeper needs its
      // own line, because a subtree match here would swallow the film.
      asset("/media/:file", MONTH),
      asset("/media/schools/:path*", MONTH),
      asset("/media/stills/:path*", MONTH),
      asset("/media/medical/:path*", MONTH),
      asset("/media/recruiters/:path*", MONTH),

      asset("/brand/:path*", MONTH),

      // Next's own output, whose filenames carry a content hash: a change is a
      // new URL, so this can be cached hard.
      asset("/_next/static/:path*", YEAR),

      // Icons and the social card, enumerated rather than pattern-matched: a
      // `(.*\\.png)` rule would also match /brand/*.png and emit a second
      // Cache-Control there. Read by other people's crawlers as much as by
      // browsers, and neither re-fetches often.
      asset("/apple-icon.png", MONTH),
      asset("/icon-192.png", MONTH),
      asset("/icon-512.png", MONTH),
      asset("/opengraph-image.png", MONTH),
      asset("/llms.txt", MONTH),
    ];
  }
};

export default nextConfig;
