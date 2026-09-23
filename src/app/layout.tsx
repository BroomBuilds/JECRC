import type { Metadata, Viewport } from "next";
import { Cinzel, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Reveal from "@/components/layout/Reveal";
import Cursor from "@/components/layout/Cursor";
import { BRAND, SITE_URL } from "@/lib/content/site";
import { jsonLd } from "@/lib/seo/schema";
import landscapeFilm from "@/lib/tour-manifest-landscape.json";
import portraitFilm from "@/lib/tour-manifest-portrait.json";

/**
 * The text face for the whole site.
 *
 * DM Sans, which is what the group already sets its own pages in: the base
 * style on jecrcuniversity.edu.in is DM Sans 400 at 16px over 24px, and the
 * page inherits that rather than approximating it.
 *
 * Loaded as the variable cut, so the 500 to 800 the display helpers ask for
 * cost nothing beyond the one file. Roman only: nothing on this site is set in
 * italic, so the italic cut is never requested and never downloaded.
 */
const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
});

/**
 * The wordmark face, and nothing else.
 *
 * The published lockup sets "JECRC UNIVERSITY" in Anavio, a classical Roman
 * face from Greater Albion Typefounders, which is licensed and not on Google
 * Fonts. Cinzel is the closest free equivalent, and not merely by genre: both
 * descend from the same Roman inscriptional capitals, and set against the
 * artwork at matched cap height Cinzel comes out at 562px to the mark's 552,
 * with the same shallow-hooked J, the same slanted terminal on the C, the same
 * straight splayed leg on the R and the same low stroke contrast. The other
 * free candidates each fail on one of those: Cormorant's hairlines are far
 * thinner than anything in the mark, Marcellus and Forum are both too narrow.
 *
 * Cinzel has no lowercase, which suits a mark set in capitals over a second
 * line of small capitals of the same design.
 *
 * Loaded as the variable cut so both lines can carry the weights measured off
 * the artwork rather than the nearest named step. One file covers both.
 *
 * Scoped to the wordmark. DM Sans still sets every heading, label and
 * paragraph on the page; nothing else is allowed to reach for this.
 */
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
});

const TITLE = "JECRC, Build Your World";
const DESCRIPTION =
  "JECRC University Jaipur, JECRC University Alwar NCR and JECRC Foundation. Eleven schools, 29,643 students, 2,104 offers from 200 recruiters, and 30,000+ alumni across 35 countries. Apply through the group's own admissions portals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TITLE} | Jaipur and Alwar NCR`,
    template: `%s | ${BRAND.group}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.group,
  authors: [{ name: BRAND.group, url: SITE_URL }],
  creator: BRAND.group,
  publisher: BRAND.group,
  keywords: [
    "JECRC University",
    "JECRC University Jaipur",
    "JECRC University Alwar NCR",
    "JECRC Foundation",
    "top private university Rajasthan",
    "B.Tech admission Jaipur",
    "MBA Jaipur",
    "engineering college Jaipur",
    "JECRC admission 2026",
    "JECRC placements",
  ],
  alternates: { canonical: "/" },
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BRAND.group,
    title: `${TITLE} | Jaipur and Alwar NCR`,
    description: DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "JECRC, Build Your World. JECRC University Jaipur, Alwar NCR, and JECRC Foundation.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Jaipur and Alwar NCR`,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: true, address: false, email: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  // Named so an answer engine quoting this page can attribute it. The
  // publisher and the subject are the same organisation here, which is
  // worth saying out loud rather than leaving to be inferred.
  other: {
    "og:locale": "en_IN",
    "article:publisher": "https://jecrcuniversity.edu.in/",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${dmSans.variable} ${cinzel.variable}`}>
      <head>
        {/* The tour's poster is the largest paint on the page, so it is in
            flight before React runs.

            Two of them, each behind a media condition, because the page ships
            one film per shape and a phone must never pay for the landscape
            poster. `media` on a preload link is evaluated by the preload
            scanner before any request is made, so exactly one of these two is
            ever fetched — the same condition the <picture> in ScrollTour uses,
            so the preload and the element agree and the poster is never
            fetched twice. */}
        <link
          rel="preload"
          as="image"
          type="image/webp"
          media="(orientation: landscape)"
          href={landscapeFilm.poster}
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          type="image/webp"
          media="(orientation: portrait)"
          href={portraitFilm.poster}
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          // Server-rendered from lib/seo/schema.ts, which is built from the
          // same content the page renders, so the two cannot drift.
          dangerouslySetInnerHTML={{ __html: jsonLd() }}
        />
      </head>
      <body>
        <a
          href="#build"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-crimson focus:px-6 focus:py-3 focus:text-white"
        >
          Skip the film
        </a>
        <SmoothScroll />
        <Reveal />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
