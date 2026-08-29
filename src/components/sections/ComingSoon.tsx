import { ANNOUNCEMENT } from "@/lib/content/announcement";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * Coming-soon banner.
 *
 * Full-bleed brand red, sitting between two dark sections. It is the only
 * saturated band on the page, which is what makes it read as an announcement
 * rather than another content block. Returns null when the announcement is
 * switched off, so pulling it needs no change to the page.
 */
export default function ComingSoon() {
  if (!ANNOUNCEMENT.live) return null;

  return (
    <section aria-labelledby="coming-soon-title" className="relative overflow-hidden bg-crimson">
      {/* Diagonal sheen, fixed, so the band has depth without motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.16) 0%, transparent 38%, transparent 62%, rgba(0,0,0,0.22) 100%)",
        }}
      />

      <div className="u-shell relative grid gap-12 py-20 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20 lg:py-28">
        <div>
          <span data-reveal className="u-label inline-flex items-center gap-3 text-white/85">
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            {ANNOUNCEMENT.eyebrow}
          </span>

          <h2
            id="coming-soon-title"
            data-reveal
            style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            className="u-display mt-6 max-w-[16ch] text-[2.5rem] leading-[1.02] text-white sm:text-[3.25rem] lg:text-[4rem]"
          >
            {ANNOUNCEMENT.title}
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
            className="mt-7 max-w-[50ch] text-[15px] leading-[1.85] text-white/85 md:text-base"
          >
            {ANNOUNCEMENT.detail}
          </p>

          <a
            data-reveal
            style={{ "--reveal-delay": "210ms" } as React.CSSProperties}
            href={ANNOUNCEMENT.cta.href}
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 transition-colors duration-300 hover:bg-ink"
          >
            <span className="u-label text-crimson transition-colors duration-300 group-hover:text-white">
              {ANNOUNCEMENT.cta.label}
            </span>
            <ArrowRight className="h-4 w-4 text-crimson transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-white" />
          </a>
        </div>

        {/* Dividers are borders on the rows, not a background behind a 1px gap:
            the rows fade in one after another, and a background would show
            through the ones that have not arrived yet as a pale band. */}
        <ul className="flex flex-col self-center overflow-hidden rounded-xl border border-white/20">
          {ANNOUNCEMENT.items.map((item, i) => (
            <li
              key={item.label}
              data-reveal
              style={{ "--reveal-delay": `${120 + i * 90}ms` } as React.CSSProperties}
              className="flex items-center justify-between gap-6 border-b border-white/20 px-6 py-5 last:border-b-0"
            >
              <span className="text-[14.5px] font-medium leading-snug text-white">{item.label}</span>
              <span className="u-label shrink-0 rounded-full border border-white/40 px-3 py-1.5 text-white/85">
                {item.state}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
