import Image from "next/image";
import { PROGRAMMES } from "@/lib/content/programmes";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * Schools and levels.
 *
 * An alternating editorial rhythm rather than a card grid: six schools in a
 * grid all look like the same school, and the point of this section is that
 * they are not. Images are frames lifted from the tour film, so the section
 * restyles itself whenever the film is replaced.
 */
export default function Programmes() {
  return (
    <Section id="programmes" tone="ink">
      <SectionHeading
        eyebrow="What you can study"
        title={
          <>
            Eleven schools.{" "}
            <span className="u-display-italic text-crimson">One way of working.</span>
          </>
        }
        lead="Undergraduate, postgraduate and doctoral programmes across the group, with more than fifty at the Alwar NCR campus alone. Project work starts in the first semester, not the final year."
      />

      <div className="mt-20 flex flex-col gap-20 md:mt-28 md:gap-28">
        {PROGRAMMES.map((p, i) => {
          const flipped = i % 2 === 1;
          return (
            <article
              key={p.school}
              className="grid items-center gap-8 md:gap-14 lg:grid-cols-2 lg:gap-20"
            >
              <div
                data-reveal="mask"
                className={`relative aspect-[16/11] overflow-hidden rounded-2xl border border-line ${
                  flipped ? "lg:order-2" : ""
                }`}
              >
                <Image
                  src={p.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className="object-cover transition-transform duration-[1.4s] ease-out-expo hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent"
                />
                <span className="u-figure absolute bottom-5 left-6 text-[3.5rem] leading-none text-white/25">
                  {p.index}
                </span>
              </div>

              <div className={flipped ? "lg:order-1" : ""}>
                <p data-reveal className="u-label text-crimson">
                  {p.levels}
                </p>
                <h3
                  data-reveal
                  style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
                  className="u-display mt-5 max-w-[15ch] pb-[0.08em] text-[2rem] leading-[1.05] text-paper md:text-[2.75rem]"
                >
                  {p.school}
                </h3>
                <p
                  data-reveal
                  style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
                  className="mt-6 max-w-[48ch] text-[15px] leading-[1.85] text-mist"
                >
                  {p.body}
                </p>
                <ul
                  data-reveal
                  style={{ "--reveal-delay": "210ms" } as React.CSSProperties}
                  className="mt-8 flex flex-wrap gap-2"
                  aria-label={`Campuses offering ${p.school}`}
                >
                  {p.campuses.map((c) => (
                    <li
                      key={c}
                      className="u-label rounded-full border border-line px-4 py-2 text-dim"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
