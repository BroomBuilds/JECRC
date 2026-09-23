import Image from "next/image";
import { AMBASSADOR } from "@/lib/content/ambassador";
import VideoDialog from "@/components/ui/VideoDialog";

/**
 * A new chapter begins.
 *
 * The one warm band on the page: a bone ground rather than paper, so it reads
 * as a moment without needing a border or a card. The portrait slot degrades
 * to a branded frame when no image is set, so pulling the photograph never
 * leaves a hole.
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
              /* `priority` on a below-the-fold image, deliberately. Left lazy
                 it does not request until the viewport reaches it, by which
                 time the tour's preloader has the connection full and 53 KB
                 takes a second. The preload gets it in before that queue
                 exists. The film poster keeps its own fetchPriority="high", so
                 the LCP does not pay for this. */
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
          {/* The name, and nothing beside it. The role line that used to sit
              opposite was the last of the ambassador furniture. */}
          <figcaption className="mt-5 border-t border-rule pt-4">
            <span className="u-grotesk text-[1.15rem] text-ink">{AMBASSADOR.name}</span>
          </figcaption>
        </figure>

        {/* ---- copy ---- */}
        <div>
          {/* Two lines, one heading. The second is the greeting and carries
              the colour, the same relationship the film's title cards use —
              so it is a `<span>` inside the h2 rather than a second heading
              that would put an empty level in the outline. */}
          <h2
            data-reveal
            className="u-display pb-[0.12em] text-[2rem] text-ink sm:text-[2.9rem] lg:text-[clamp(3.25rem,4.4vw,4.75rem)]"
          >
            {AMBASSADOR.title}
            <span className="u-display-strong mt-1 block text-[min(7vw,1.9rem)] leading-[1.15] text-crimson sm:text-[min(5.3vw,2.55rem)] lg:text-[min(3.35vw,3.65rem)]">
              {AMBASSADOR.subtitle}
            </span>
          </h2>

          {AMBASSADOR.body.map((para, i) => (
            <p
              key={i}
              data-reveal
              style={{ "--reveal-delay": `${140 + i * 60}ms` } as React.CSSProperties}
              className="mt-6 max-w-[52ch] text-[15.5px] leading-[1.75] text-graphite md:mt-7 md:text-[17px]"
            >
              {para}
            </p>
          ))}

          {/* The sign-off is the one line in the section that is an invitation
              rather than a description, so it is set apart from the paragraphs
              it ends rather than becoming the fourth of them. */}
          <p
            data-reveal
            style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
            className="u-display-strong mt-8 border-l-2 border-crimson pl-5 text-[1.3rem] leading-[1.35] text-ink sm:text-[1.6rem] md:mt-10 md:pl-6 md:text-[2.15rem]"
          >
            {AMBASSADOR.signoff}
          </p>

          {/* The announcement plays here rather than sending the visitor to
              YouTube and losing them. VideoDialog is the only client component
              in this section, so the rest stays server-rendered. */}
          <div
            data-reveal
            style={{ "--reveal-delay": "400ms" } as React.CSSProperties}
            className="mt-10"
          >
            <VideoDialog
              videoId={AMBASSADOR.watchVideoId}
              label={AMBASSADOR.watchLabel}
              title={AMBASSADOR.watchTitle}
              href={AMBASSADOR.watchHref}
              eyebrow={AMBASSADOR.title}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
