import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Pinyon_Script } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/* The accent face used by `.script`.
   Default: Cormorant italic — same two-tone headline device as the Royal Palace
   build, in a register that suits a university.
   For the original copperplate, swap `--font-script` below to `pinyon.variable`. */
const pinyon = Pinyon_Script({ variable: "--font-pinyon", subsets: ["latin"], weight: "400", display: "swap" });

const sans = Jost({ variable: "--font-sans-ui", subsets: ["latin"], weight: ["300", "400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "JECRC University — Build Your World | Jaipur, Rajasthan",
  description:
    "Eleven schools, thirty-two acres at Sitapura, twenty-six thousand students. Scroll the campus. JECRC University, Jaipur.",
  openGraph: { title: "JECRC University — Build Your World", description: "Scroll the campus.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${pinyon.variable} ${sans.variable}`}
      style={{ ["--font-script" as string]: "var(--font-display)" }}
    >
      <body className="antialiased">
        <SmoothScroll />
        <Reveal />
        {children}
      </body>
    </html>
  );
}
