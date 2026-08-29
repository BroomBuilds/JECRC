import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Reveal from "@/components/layout/Reveal";
import { BRAND, SITE_URL } from "@/lib/content/site";
import { jsonLd } from "@/lib/seo/schema";

/**
 * The pair.
 *
 * Archivo is the grotesque: navigation, eyebrows, buttons, the majors list,
 * every figure. It is the closest open face to the Aktiv Grotesk that carries
 * arts.vcu.edu, and unlike most free grotesques it has a genuine 800, which is
 * what the display sizes need.
 *
 * Newsreader is the editorial voice, standing in for Mercury: sturdy rather
 * than fashionable, and it holds up at both 20px and 90px. Both are variable,
 * so the weight range costs one file each.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
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
        url: "/media/tour/poster.jpg",
        width: 1200,
        height: 675,
        alt: "The JECRC University campus at Sitapura, Jaipur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Jaipur and Alwar NCR`,
    description: DESCRIPTION,
    images: ["/media/tour/poster.jpg"],
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
    <html lang="en-IN" className={`${archivo.variable} ${newsreader.variable}`}>
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
          href="#campuses"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-crimson focus:px-6 focus:py-3 focus:text-white"
        >
          Skip the film, go to the campuses
        </a>
        <SmoothScroll />
        <Reveal />
        {children}
      </body>
    </html>
  );
}
