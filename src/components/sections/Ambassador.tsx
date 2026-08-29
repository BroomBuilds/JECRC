import Image from "next/image";
import { AMBASSADOR } from "@/lib/content/ambassador";
import { Eyebrow } from "@/components/ui/Section";
import { ArrowUpRight, PlayMark } from "@/components/ui/Icons";

/**
 * Brand ambassador.
 *
 * Full-bleed and darker than its neighbours so it lands as a moment rather than
 * another card. The portrait slot degrades to a branded frame when no licensed
 * image is set, which keeps the section shippable before the shoot assets
 * arrive instead of leaving a hole in the page.
 */
export default function Ambassador() {
  return (
    <section
      id="ambassador"
      style={{ scrollMarginTop: "6.5rem" }}
      className="u-grain relative overflow-hidden bg-ink py-24 md:py-32 lg:py-40"
    >
      {/* A single warm light, off to one side. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[42rem] w-[42rem] -translate-y-1/2 rounded-full opacity-[0.16] blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--color-crimson) 0%, transparent 68%)" }}
      />

      <div className="u-shell relative grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
        {/* ---- portrait ---- */}
        <figure data-reveal="mask" className="relative order-1 lg:order-none">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-surface">
            {AMBASSADOR.portrait ? (
              <Image
                src={AMBASSADOR.portrait}
                alt={AMBASSADOR.portraitAlt}
                fill
                sizes="(min-width: 1024px) 40vw, 92vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
                <span className="u-display text-[5.5rem] leading-none text-crimson/25">VM</span>
                <p className="u-label text-dim">Campaign portrait to follow</p>
              </div>
            )}

            {/* Name plate, over the bottom edge of whichever of the two is
                showing. */}
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink via-ink/85 to-transparent p-6 pt-16">
              <p className="u-display text-[1.6rem] leading-none text-paper">{AMBASSADOR.name}</p>
              <p className="mt-2 text-[12.5px] text-mist">{AMBASSADOR.role}</p>
            </figcaption>
          </div>
        </figure>

        {/* ---- copy ---- */}
        <div>
          <div data-reveal>
            <Eyebrow>{AMBASSADOR.eyebrow}</Eyebrow>
          </div>

          <h2
            data-reveal
            style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            className="u-display mt-6 pb-[0.1em] text-[2.5rem] leading-[1.02] text-paper sm:text-[3.25rem] lg:text-[4.25rem]"
          >
            {AMBASSADOR.name}
            <span className="mt-2 block u-display-italic text-crimson">is the face of JECRC</span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
            className="mt-8 max-w-[52ch] text-[15px] leading-[1.9] text-mist md:text-base"
          >
            {AMBASSADOR.body}
          </p>

          <blockquote
            data-reveal
            style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
            className="mt-10 border-l-2 border-crimson pl-6"
          >
            <p className="u-display-italic text-[1.6rem] leading-[1.35] text-paper md:text-[2rem]">
              {AMBASSADOR.quote}
            </p>
            <cite className="u-label mt-4 block not-italic text-dim">{AMBASSADOR.quoteBy}</cite>
          </blockquote>

          <dl
            data-reveal
            style={{ "--reveal-delay": "280ms" } as React.CSSProperties}
            className="mt-12 grid gap-6 border-t border-line pt-8 sm:grid-cols-3"
          >
            {AMBASSADOR.notes.map((n) => (
              <div key={n.label}>
                <dt className="u-label text-dim">{n.label}</dt>
                <dd className="mt-2 text-[14px] leading-snug text-paper">{n.value}</dd>
              </div>
            ))}
          </dl>

          <a
            data-reveal
            style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
            href={AMBASSADOR.watchHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-4"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-crimson text-crimson transition-colors duration-400 group-hover:bg-crimson group-hover:text-white">
              <PlayMark className="ml-0.5 h-4 w-4" />
            </span>
            <span className="u-label text-paper">{AMBASSADOR.watchLabel}</span>
            <ArrowUpRight className="h-4 w-4 text-dim transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
