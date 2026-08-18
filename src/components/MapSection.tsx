"use client";

import { BRAND, LANDMARKS, ADMISSIONS } from "@/lib/content";

export default function MapSection() {
  return (
    <section id="visit" className="relative bg-cream text-ink">
      <div data-reveal className="relative w-full overflow-x-auto overflow-y-hidden md:overflow-hidden">
        <svg
          viewBox="0 0 1400 620"
          className="block h-[420px] w-[950px] max-w-none md:h-[52vw] md:max-h-[620px] md:w-full"
          role="img"
          aria-label="Illustrated map of Jaipur showing JECRC University at Sitapura"
        >
          <defs>
            <linearGradient id="parch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#efe9de" />
              <stop offset="100%" stopColor="#e2d9c9" />
            </linearGradient>
            <filter id="sft"><feGaussianBlur stdDeviation="0.4" /></filter>
          </defs>

          <rect width="1400" height="620" fill="url(#parch)" />

          <g stroke="#9c7a55" fill="none" strokeLinecap="round" opacity="0.55" filter="url(#sft)">
            {/* ring road */}
            <path strokeWidth="2.2" d="M700 78c176 0 318 104 318 232s-142 232-318 232-318-104-318-232S524 78 700 78Z" />
            {/* arteries */}
            <path strokeWidth="1.7" d="M700 78V16M700 542v66M382 310H120M1018 310h262" />
            <path strokeWidth="1.3" d="M474 148 300 48M926 148l174-100M474 472 300 572M926 472l174 100" />
            {/* the old city grid, north */}
            <g strokeWidth="0.8" opacity="0.7">
              <path d="M540 150h320M540 196h320M540 242h320" />
              <path d="M580 130v140M660 130v140M760 130v140M840 130v140" />
            </g>
            {/* industrial grid, south — where the campus is */}
            <g strokeWidth="0.85" opacity="0.75">
              <path d="M560 400h300M560 440h300M560 480h300" />
              <path d="M600 384v120M680 384v120M780 384v120M850 384v120" />
            </g>
            <g strokeWidth="1.1" opacity="0.75">
              <path d="M60 470c150-44 250-32 340 22" />
              <path d="M1340 470c-150-44-250-32-340 22" />
              <path d="M120 170c130 22 210 62 260 114" />
              <path d="M1280 170c-130 22-210 62-260 114" />
            </g>
          </g>

          <g fill="#8a6a3c" fontSize="12" letterSpacing="3" fontFamily="var(--font-sans, sans-serif)">
            <text x="700" y="40" textAnchor="middle">RING ROAD</text>
            <text x="360" y="300" >TONK ROAD</text>
            <text x="1030" y="300">JLN MARG</text>
            <text x="430" y="560" transform="rotate(-13 430 560)">SITAPURA INDUSTRIAL AREA</text>
          </g>

          <g fill="#8a6a3c" fontSize="12.5" letterSpacing="3" fontFamily="var(--font-sans, sans-serif)">
            <g transform="translate(120 232)">
              <rect x="0" y="-14" width="18" height="18" fill="none" stroke="#9c7a55" strokeWidth="1.2" />
              <path d="M3 -14v-6h12v6" fill="none" stroke="#9c7a55" strokeWidth="1.2" />
              <text x="28" y="0">RAILWAY STATION</text>
              <text x="28" y="20" fontSize="10.5" opacity="0.75">16 KM</text>
            </g>
            <g transform="translate(1080 402)">
              <text x="0" y="0">→ JAIPUR AIRPORT</text>
              <text x="0" y="20" fontSize="10.5" opacity="0.75">9 KM</text>
            </g>
            <g transform="translate(1040 132)">
              <text x="0" y="0">→ CITY CENTRE</text>
              <text x="0" y="20" fontSize="10.5" opacity="0.75">15 KM</text>
            </g>
          </g>

          {/* pin */}
          <g transform="translate(700 300)">
            <path d="M0 96c0 0 42-46 42-74A42 42 0 1 0-42 22C-42 50 0 96 0 96Z" fill="#cd201f" />
            <g fill="#f5f1ea" transform="translate(0 12)">
              <path d="M-20 4l20-11 20 11-20 11z" />
              <path d="M-11 10v10c0 4 22 4 22 0V10l-11 6z" />
              <path d="M17 8v13" strokeWidth="1.6" stroke="#f5f1ea" />
            </g>
          </g>

          {/* plaque */}
          <g transform="translate(700 434)">
            <rect x="-160" y="-30" width="320" height="60" rx="30" fill="#efe9de" stroke="#cd201f" strokeWidth="1.2" />
            <text x="0" y="-3" textAnchor="middle" fill="#2a1010" fontSize="19" letterSpacing="5" fontFamily="var(--font-display, serif)">
              JECRC UNIVERSITY
            </text>
            <text x="0" y="18" textAnchor="middle" fill="#8a6a3c" fontSize="10.5" letterSpacing="5">— SITAPURA —</text>
          </g>
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cream/60 via-transparent to-cream" />
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-28 md:px-12 md:pb-40">
        <div className="grid gap-12 border-t border-ink/10 pt-16 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <p data-reveal className="label text-ink/45">Visit &amp; Apply</p>
            <h2 data-reveal="mask" style={{ ["--d" as string]: "120ms" }} className="display mt-4 text-[10vw] leading-[1] sm:text-[6vw] lg:text-[3.6vw]">
              Sitapura, <span className="script text-crimson">Jaipur.</span>
            </h2>
            <p data-reveal style={{ ["--d" as string]: "200ms" }} className="mt-6 max-w-[44ch] text-[15px] leading-[1.95] font-light text-ink/65">
              {ADMISSIONS.body}
            </p>
            <div data-reveal style={{ ["--d" as string]: "300ms" }} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#top" className="label inline-flex items-center justify-center bg-crimson px-7 py-4 text-white transition-colors duration-500 hover:bg-[#a91a19]">
                {ADMISSIONS.primary}
              </a>
              <a href="#top" className="label inline-flex items-center justify-center border border-ink/25 px-7 py-4 text-ink transition-colors duration-500 hover:bg-ink/5">
                {ADMISSIONS.secondary}
              </a>
            </div>
          </div>

          <div data-reveal style={{ ["--d" as string]: "220ms" }} className="md:col-span-3">
            <p className="label text-ink/45">The Campus</p>
            <address className="mt-5 not-italic text-[15px] leading-[2] font-light text-ink/70">
              {BRAND.address.map((l) => <span key={l} className="block">{l}</span>)}
            </address>
            <div className="mt-6 flex flex-col gap-2 text-[13px] tracking-[0.12em] text-ink/70">
              <a href={BRAND.phoneHref} className="link-underline w-fit">{BRAND.phone}</a>
              <a href={`mailto:${BRAND.email}`} className="link-underline w-fit">{BRAND.email}</a>
            </div>
          </div>

          <div data-reveal style={{ ["--d" as string]: "340ms" }} className="md:col-span-4">
            <p className="label text-ink/45">Getting Here</p>
            <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {LANDMARKS.map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-6 py-4">
                  <span className="text-[15px] font-light text-ink/75">{l.label}</span>
                  <span className="label text-ink/45">{l.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
