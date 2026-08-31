import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Reveal from "@/components/layout/Reveal";
import Cursor from "@/components/layout/Cursor";
import { BRAND, SITE_URL } from "@/lib/content/site";
import { jsonLd } from "@/lib/seo/schema";

/**
 * One typeface for the whole site.
 *
 * Hanken Grotesk, 400 to 900, roman only. It is here for the Gotham register:
 * a geometric skeleton, a tall x-height, flat terminals and wide even-width
 * capitals, which is what gives that family its institutional, signage-like
 * authority. Gotham itself is licensed; the usual free stand-in is Montserrat,
 * which is on every second university site.
 *
 * Every level of hierarchy comes out of size, weight and tracking rather than
 * a second face, and nothing on this site is set in italic, so the italic cut
 * is never requested and never downloaded.
 */
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  display: "swap",
});

const TITLE = "JECRC, Build Your World";
const DESCRIPTION =
  "JECRC University Jaipur, JECRC University Alwar NCR and JECRC Foundation. Eleven schools, 26,000 students, 2,104 offers from 200 recruiters, and 34,000 alumni across 35 countries. Applications for 2026 to 2027 are open.";

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
    <html lang="en-IN" className={hanken.variable}>
      <head>
        {/* The tour's first frames are the largest paint on the page and are
            fetched by script, so the connection is warmed before React runs. */}
        <link rel="preload" as="image" href="/media/tour/poster.jpg" fetchPriority="high" />
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
