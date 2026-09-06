import Image from "next/image";
import { AMBASSADOR } from "@/lib/content/ambassador";
import { Eyebrow } from "@/components/ui/Section";
import VideoDialog from "@/components/ui/VideoDialog";

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
      className="relative overflow-hidden bg-bone py-16 md:py-24 lg:py-28"
    >
      <div className="u-shell grid items-center gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16">
        {/* ---- portrait ---- */}
        <figure data-reveal="mask" className="relative">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-linen">
            {AMBASSADOR.portrait ? (
              /* `priority`, on an image most of a page below the fold.
                 
                 Counter-intuitive, and measured. Left lazy this did not even
                 REQUEST until 2.7s — it waits for the viewport — and by then
                 the tour's preloader is holding sixteen frames open on the
                 same connection, so 53 KB that should move in about 110ms took
                 1,054. Total, near four seconds after load on a 4G profile,
                 which is longer than anyone spends deciding to keep scrolling.
                 
                 `priority` emits a preload in the document head, so the fetch
                 starts while the HTML is still being parsed — before the tour
                 effect has mounted and before there is any queue to sit behind.
                 It costs one 53 KB request on a page that ships megabytes of
                 film, and it is done long before the visitor arrives. The film
                 poster above it keeps its own fetchPriority="high", so the LCP
                 is not what pays for this. */
              <Image
                src={AMBASSADOR.portrait}
                alt={AMBASSADOR.portraitAlt}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 92vw"
                placeholder="blur"
                blurDataURL={AMBASSADOR.portraitBlur}
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
            className="u-display mt-5 pb-[0.12em] text-[2rem] text-ink sm:mt-6 sm:text-[2.9rem] lg:text-[clamp(3.25rem,4.4vw,4.75rem)]"
          >
            {AMBASSADOR.name}
            <span className="u-display-strong mt-1 block text-crimson">is the face of JECRC</span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
            className="mt-6 max-w-[52ch] text-[15.5px] leading-[1.75] text-graphite md:mt-8 md:text-[17px]"
          >
            {AMBASSADOR.body}
          </p>

          <blockquote
            data-reveal
            style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
            className="mt-8 border-l-2 border-crimson pl-5 md:mt-10 md:pl-6"
          >
            <p className="u-display-strong text-[1.3rem] leading-[1.35] text-ink sm:text-[1.6rem] md:text-[2.15rem]">
              {AMBASSADOR.quote}
            </p>
            <cite className="u-eyebrow mt-4 block not-italic text-quiet">{AMBASSADOR.quoteBy}</cite>
          </blockquote>

          <dl
            data-reveal
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
            className="mt-10 grid gap-6 border-t border-rule pt-7 sm:grid-cols-3"
          >
            {AMBASSADOR.notes.map((n) => (
              <div key={n.label}>
                <dt className="u-eyebrow text-quiet">{n.label}</dt>
                <dd className="mt-2 text-[15px] font-medium leading-snug text-ink">{n.value}</dd>
              </div>
            ))}
          </dl>

          {/* The announcement plays here rather than sending the visitor to
              YouTube and losing them. VideoDialog is the only client component
              in this section, so the rest stays server-rendered. */}
          <div
            data-reveal
            style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
            className="mt-10"
          >
            <VideoDialog
              videoId={AMBASSADOR.watchVideoId}
              label={AMBASSADOR.watchLabel}
              title={AMBASSADOR.watchTitle}
              href={AMBASSADOR.watchHref}
              eyebrow={AMBASSADOR.eyebrow}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
