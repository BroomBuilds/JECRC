"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { PROGRAMMES } from "@/lib/content/schools";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ChevronDown } from "@/components/ui/Icons";

/**
 * Explore our programmes.
 *
 * The list mechanic is the one from arts.vcu.edu, measured off the live page:
 * a black band where every row sits at opacity 0.2 and comes to 1 when it is
 * active, each row owning a portrait figure pinned to its right that fades in
 * while the image inside it slides 100px. Two transforms on two elements, both
 * 0.4s: the frame arrives, the picture catches up. One element doing both reads
 * as a slide; two reads as a reveal.
 *
 * What is NOT theirs is the content. This is deliberately not a list of school
 * names, because "School of Engineering" is a thing every university has and a
 * thing anyone can find on jecrcuniversity.edu.in in ten seconds. These are the
 * degrees that carry an industry partner in the award itself, which is the one
 * claim the group can make that its neighbours cannot.
 *
 * The dim is gated on `(hover: hover)` in CSS: on a touch device there is no
 * hover, so every row would sit at 0.2 forever and the list would read as
 * disabled.
 */

/** Matched to the source: figure fade, image slide and row dim all share it. */
const T = "400ms";

export default function Majors() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const uid = useId();

  // Hover wins while the pointer is on a row; otherwise the open row stays lit,
  // so the picture does not vanish the moment you move to read the panel.
  const active = hovered ?? open;

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
            Explore our programmes
          </h2>
          <p className="mt-6 text-[15.5px] leading-[1.7] text-white/60 md:text-[16.5px]">
            Not the school list. These are the degrees written with the firms that go on to hire
            from them, and they carry that partner in the award itself.
          </p>
        </div>

        <ul className="relative mt-12 md:mt-16" onMouseLeave={() => setHovered(null)}>
          {PROGRAMMES.map((p) => {
            const isActive = active === p.slug;
            const isOpen = open === p.slug;
            const panelId = `${uid}-${p.slug}`;

            return (
              <li
                key={p.slug}
                onMouseEnter={() => setHovered(p.slug)}
                data-majors-row
                data-active={isActive}
                className="relative border-t border-white/15 last:border-b"
              >
                {/* ---- the row ---- */}
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onFocus={() => setHovered(p.slug)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setOpen(isOpen ? null : p.slug)}
                    data-cursor={isOpen ? "Close" : "Open"}
                    className="group relative z-10 grid w-full grid-cols-[1fr_auto] items-center gap-4 py-3.5 text-left md:gap-8 md:py-5"
                  >
                    {/* Name only. The partner is the reason the programme is
                        on this list, but repeating it under every row turned
                        the list into a wall of small red type. It reappears in
                        the open panel, where there is room to read it. */}
                    <span className="u-grotesk block min-w-0 max-w-[16ch] text-[6.4vw] leading-[1.08] sm:text-[4.2vw] lg:max-w-none lg:text-[clamp(1.9rem,2.9vw,2.85rem)]">
                      {p.name}
                    </span>

                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-white transition-transform duration-500 ease-out-expo",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
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
                    opacity: isActive ? (isOpen ? 0.2 : 1) : 0,
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
                    <Image src={p.image} alt="" fill sizes="32rem" className="object-cover" />
                  </div>
                </figure>

                {/* ---- the panel ---- */}
                <div
                  id={panelId}
                  role="region"
                  aria-label={p.name}
                  inert={!isOpen}
                  className="relative z-10 grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out-expo"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0">
                    <div className="grid gap-8 pb-10 pt-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-14 md:pb-14 xl:max-w-[58%]">
                      <div>
                        <p className="max-w-[44ch] text-[15px] leading-[1.75] text-white/75">
                          {p.why}
                        </p>
                        <a
                          href="#apply"
                          className="u-pill mt-8 text-paper hover:bg-paper hover:text-obsidian"
                        >
                          Apply for this
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div>
                        <p className="u-eyebrow text-white/45">The award</p>
                        <p className="mt-3 text-[15px] font-medium leading-snug text-paper">
                          {p.award}
                        </p>
                        <p className="u-eyebrow mt-7 text-white/45">School</p>
                        <p className="mt-3 text-[14px] text-white/70">{p.school}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

      </div>
    </section>
  );
}
