import Crest from "./Crest";
import { BRAND, FOOTER_LINKS } from "@/lib/content";

const Social = ({ label, d }: { label: string; d: string }) => (
  <a href="#" aria-label={label} className="text-sand/60 transition-colors duration-500 hover:text-crimson-pale">
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  </a>
);

const Col = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <p className="label text-crimson-soft/80">{title}</p>
    <ul className="mt-5 space-y-3">
      {items.map((l) => (
        <li key={l}><a href="#top" className="label link-underline text-sand/70 hover:text-paper">{l}</a></li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-maroon grain">
      <div className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 select-none opacity-[0.05]">
        <span className="display text-[34vw] leading-none text-paper">JU</span>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 py-24 md:px-12 md:py-32">
        <div className="grid gap-14 md:grid-cols-12 md:gap-10">
          <div data-reveal className="md:col-span-3">
            <Crest className="h-36 w-36 text-paper/85" strokeWidth={0.9} />
          </div>

          <div data-reveal style={{ ["--d" as string]: "120ms" }} className="md:col-span-4">
            <p className="label text-crimson-soft/80">The Campus</p>
            <p className="script mt-4 text-[7vw] leading-[1.45] text-crimson-pale sm:text-[3.4vw] lg:text-[1.9vw]">
              {BRAND.address.map((l) => <span key={l} className="block">{l}</span>)}
            </p>
            <div className="mt-8 flex flex-col gap-2 text-[12px] tracking-[0.18em] text-sand/70">
              <a href={BRAND.phoneHref} className="link-underline w-fit">{BRAND.phone}</a>
              <a href={`mailto:${BRAND.email}`} className="link-underline w-fit">{BRAND.email}</a>
            </div>
          </div>

          <div data-reveal style={{ ["--d" as string]: "220ms" }} className="md:col-span-3">
            <Col title="Study" items={FOOTER_LINKS.study} />
          </div>

          <div data-reveal style={{ ["--d" as string]: "320ms" }} className="md:col-span-2">
            <Col title="About" items={FOOTER_LINKS.about} />
            <div className="mt-8 flex items-center gap-5">
              <Social label="Instagram" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.5 6.5h.01" />
              <Social label="Facebook" d="M14 8h2.5V5H14a4 4 0 0 0-4 4v2H8v3h2v7h3v-7h2.5l.5-3H13V9a1 1 0 0 1 1-1Z" />
              <Social label="X" d="M4 4l7.5 9.5L4.5 20M20 4l-7.6 8.6L20 20h-4l-9-11H4" />
              <Social label="LinkedIn" d="M4 9h3v11H4zM5.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM10 20V9h3v1.6A3.6 3.6 0 0 1 16.2 9c2.4 0 3.8 1.6 3.8 4.4V20h-3v-6c0-1.5-.6-2.4-1.9-2.4S13 12.6 13 14.1V20Z" />
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/[0.08] pt-8">
          <p className="label max-w-[70ch] text-sand/45">
            The campus film on this page was made by Om Gulati (B.Tech. AI &amp; DS, 1st year) and
            Jayaditya Sharma (B.Tech. AI &amp; DS, 3rd year) — generated with AI, start to finish.
          </p>
          <div className="mt-6 flex flex-col gap-4 text-[10px] tracking-[0.3em] uppercase text-sand/40 md:flex-row md:items-center md:justify-between">
            <span>© {BRAND.year} {BRAND.name}. All Rights Reserved.</span>
            <span>Jaipur · Rajasthan · India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
