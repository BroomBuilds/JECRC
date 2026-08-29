import { ANNOUNCEMENT } from "@/lib/content/announcement";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * Coming-soon banner.
 *
 * Full-bleed brand red between two pale sections. It is the only saturated band
 * on the page, which is what makes it read as an announcement rather than
 * another content block. Returns null when the announcement is switched off, so
 * pulling it needs no change to the page.
 */
export default function ComingSoon() {
  if (!ANNOUNCEMENT.live) return null;

  return (
    <section aria-labelledby="coming-soon-title" className="bg-crimson text-paper">
      <div className="u-shell grid gap-12 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20 lg:py-28">
        <div>
          <span data-reveal className="u-eyebrow inline-flex items-center gap-3 text-white/85">
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-paper" />
            </span>
            {ANNOUNCEMENT.eyebrow}
          </span>

          <h2
            id="coming-soon-title"
            data-reveal
            style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            className="u-serif mt-6 max-w-[15ch] text-[2.75rem] sm:text-[3.5rem] lg:text-[clamp(3.25rem,4.2vw,4.5rem)]"
          >
            {ANNOUNCEMENT.title}
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
            className="mt-8 max-w-[48ch] text-[16px] leading-[1.7] text-white/85 md:text-[17px]"
          >
            {ANNOUNCEMENT.detail}
          </p>

          <a
            data-reveal
            style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
            href={ANNOUNCEMENT.cta.href}
            className="u-pill group mt-10 border-paper bg-paper text-crimson hover:bg-ink hover:text-paper"
          >
            {ANNOUNCEMENT.cta.label}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* Dividers are borders on the rows, not a background behind a 1px gap:
            the rows fade in one after another, and a background would show
            through the ones that have not arrived yet as a pale band. */}
        <ul className="flex flex-col self-center overflow-hidden rounded-lg border border-white/25">
          {ANNOUNCEMENT.items.map((item, i) => (
            <li
              key={item.label}
              data-reveal
              style={{ "--reveal-delay": `${110 + i * 80}ms` } as React.CSSProperties}
              className="flex items-center justify-between gap-6 border-b border-white/25 px-6 py-5 last:border-b-0"
            >
              <span className="text-[15px] font-semibold leading-snug">{item.label}</span>
              <span className="u-eyebrow shrink-0 rounded-full border border-white/40 px-3 py-1.5 text-white/85">
                {item.state}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
