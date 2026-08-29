import Image from "next/image";
import { AMBASSADOR } from "@/lib/content/ambassador";
import { Eyebrow } from "@/components/ui/Section";
import { ArrowUpRight, PlayMark } from "@/components/ui/Icons";

/**
 * Brand ambassador.
 *
 * The one warm band on the page: a bone ground rather than paper, so it reads
 * as a moment without needing a border or a card. The portrait slot degrades to
 * a branded frame when no licensed image is set, which keeps the section
 * shippable before the shoot assets arrive instead of leaving a hole.
 */
export default function Ambassador() {
  return (
    <section
      id="ambassador"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-bone py-20 md:py-28 lg:py-36"
    >
      <div className="u-shell grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        {/* ---- portrait ---- */}
        <figure data-reveal="mask" className="relative">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-linen">
            {AMBASSADOR.portrait ? (
              <Image
                src={AMBASSADOR.portrait}
                alt={AMBASSADOR.portraitAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="u-grotesk-black text-[5.5rem] leading-none text-crimson/20">
                  VM
                </span>
                <p className="u-eyebrow text-quiet">Campaign portrait to follow</p>
              </div>
            )}
          </div>
          <figcaption className="mt-5 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
            <span className="u-grotesk text-[1.15rem] text-ink">{AMBASSADOR.name}</span>
            <span className="text-[13px] text-quiet">{AMBASSADOR.role}</span>
          </figcaption>
        </figure>

        {/* ---- copy ---- */}
        <div>
          <div data-reveal>
            <Eyebrow>{AMBASSADOR.eyebrow}</Eyebrow>
          </div>

          <h2
            data-reveal
            style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            className="u-serif mt-6 text-[2.75rem] text-ink sm:text-[3.5rem] lg:text-[clamp(3.25rem,4.4vw,4.75rem)]"
          >
            {AMBASSADOR.name}
            <span className="u-serif-italic mt-1 block text-crimson">is the face of JECRC</span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
            className="mt-8 max-w-[52ch] text-[16px] leading-[1.75] text-graphite md:text-[17px]"
          >
            {AMBASSADOR.body}
          </p>

          <blockquote
            data-reveal
            style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
            className="mt-10 border-l-2 border-crimson pl-6"
          >
            <p className="u-serif-italic text-[1.75rem] leading-[1.3] text-ink md:text-[2.15rem]">
              {AMBASSADOR.quote}
            </p>
            <cite className="u-eyebrow mt-4 block not-italic text-quiet">{AMBASSADOR.quoteBy}</cite>
          </blockquote>

          <dl
            data-reveal
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
            className="mt-12 grid gap-6 border-t border-rule pt-8 sm:grid-cols-3"
          >
            {AMBASSADOR.notes.map((n) => (
              <div key={n.label}>
                <dt className="u-eyebrow text-quiet">{n.label}</dt>
                <dd className="mt-2 text-[15px] font-medium leading-snug text-ink">{n.value}</dd>
              </div>
            ))}
          </dl>

          <a
            data-reveal
            style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
            href={AMBASSADOR.watchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-crimson text-crimson transition-colors duration-400 group-hover:bg-crimson group-hover:text-paper">
              <PlayMark className="ml-0.5 h-4 w-4" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-ink">
              {AMBASSADOR.watchLabel}
            </span>
            <ArrowUpRight className="h-4 w-4 text-quiet transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
