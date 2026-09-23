"use client";

import Image from "next/image";
import { useState } from "react";
import { SCHOOLS } from "@/lib/content/schools";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * Find your programme.
 *
 * The list mechanic is the one from arts.vcu.edu, measured off the live page:
 * a black band where every row sits at opacity 0.2 and comes to 1 when it is
 * active, each row owning a portrait figure pinned to its right that fades in
 * while the image inside it slides 100px. Two transforms on two elements, both
 * 0.4s: the frame arrives, the picture catches up. One element doing both reads
 * as a slide; two reads as a reveal.
 *
 * ---- no accordion ----
 *
 * The rows used to open. Each one held the school's sentence, its award
 * families and six or seven of its programmes, and every one of those was a
 * copy of something on the school's own page — kept current there by the
 * people whose job that is, and going stale here the moment they change it.
 *
 * So a row is a link now. One click, one destination, nothing to open first.
 * The scraped copy has not been thrown away: it still lives in
 * content/schools.ts and is still read by `buildGraph()` in lib/seo/schema.ts,
 * where a description and an offer catalogue are worth having and where being
 * a few months behind the portal costs nothing.
 *
 * The dim is gated on `(hover: hover)` in CSS: on a touch device there is no
 * hover, so every row would sit at 0.2 forever and the list would read as
 * disabled.
 */

/** Matched to the source: figure fade, image slide and row dim all share it. */
const T = "400ms";

export default function Majors() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="schools"
      data-cursor-invert
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-obsidian py-16 text-paper md:py-24"
    >
      <div className="u-shell">
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="u-eyebrow text-[15px] font-semibold tracking-[0.06em] text-paper md:text-[16px]">
            Find your programme
          </h2>
          <p className="mt-6 text-[15.5px] leading-[1.7] text-white/60 md:text-[16.5px]">
            Eleven schools, from engineering to hospitality. Pick one and it takes you straight to
            its own page, with the full catalogue, the fee and the eligibility.
          </p>
        </div>

        <ul className="relative mt-12 md:mt-16" onMouseLeave={() => setHovered(null)}>
          {SCHOOLS.map((s) => {
            const isActive = hovered === s.slug;

            return (
              <li
                key={s.slug}
                onMouseEnter={() => setHovered(s.slug)}
                data-majors-row
                data-active={isActive}
                className="relative border-t border-white/15 last:border-b"
              >
                {/* ---- the row ----
                    An anchor, not a button. It leaves the page, so it should
                    be middle-clickable, copyable and openable in a new tab
                    like any other link on the site. */}
                <h3>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onFocus={() => setHovered(s.slug)}
                    onBlur={() => setHovered(null)}
                    data-cursor="Open"
                    className="group relative z-10 grid w-full grid-cols-[1fr_auto] items-center gap-4 py-3.5 text-left md:gap-8 md:py-5"
                  >
                    {/* The distinctive part of the name, not the full one.
                        "School of Humanities & Social Sciences" set at display
                        size is three lines of type doing the work of two
                        words; the full name goes to assistive tech below. */}
                    <span className="u-grotesk block min-w-0 max-w-[16ch] text-[6.4vw] leading-[1.08] sm:text-[4.2vw] lg:max-w-none lg:text-[clamp(1.9rem,2.9vw,2.85rem)]">
                      {s.name}
                      <span className="sr-only">
                        {" "}
                        — {s.full}, opens on jecrcuniversity.edu.in
                      </span>
                    </span>

                    {/* The arrow leans out on hover, which is the whole
                        announcement that this row leaves the site. */}
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-white transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </h3>

                {/* ---- the figure, pinned right and centred on the row ---- */}
                <figure
                  aria-hidden
                  className="pointer-events-none absolute right-[-2vw] top-1/2 z-0 hidden w-[36vw] max-w-[32rem] overflow-hidden xl:block"
                  style={{
                    // The row is `relative`, so this centres on the row it
                    // belongs to rather than on the list. That is what makes
                    // the picture track down the column as the cursor moves.
                    translate: "0 -50%",
                    opacity: isActive ? 1 : 0,
                    transition: `opacity ${T} var(--ease-out-expo)`,
                  }}
                >
                  <div
                    className="relative aspect-3/4 w-full"
                    style={{
                      translate: isActive ? "0" : "100px",
                      transition: `translate ${T} var(--ease-out-expo)`,
                    }}
                  >
                    <Image src={s.image} alt="" fill sizes="32rem" className="object-cover" />
                  </div>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
