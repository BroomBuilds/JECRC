"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { SCHOOLS } from "@/lib/content/schools";
import { cn } from "@/lib/utils/cn";
import { ArrowRight, ChevronDown } from "@/components/ui/Icons";

/**
 * Explore our schools.
 *
 * A rebuild of the majors list on arts.vcu.edu, measured off the live page
 * rather than eyeballed. The mechanics there, and here:
 *
 *   - Black band. Every row sits at opacity 0.2 and comes to 1 when it is the
 *     active one. That single move is what makes the list read as a dimmer
 *     rather than a menu.
 *   - Each row owns a portrait figure pinned to the right of the band,
 *     vertically centred on the row, at opacity 0. On activation the figure
 *     fades to 1 while the image inside it slides from 100px to 0. Two
 *     transforms on two elements, both 0.4s: the frame arrives, the picture
 *     catches up. One element doing both reads as a slide; two reads as a
 *     reveal.
 *   - Clicking a row opens it as an accordion, and the figure drops to 0.2 so
 *     the copy underneath stays readable.
 *
 * Active state is hover on a pointer device and open state on click, so the
 * whole thing works without a pointer: every row is a real button, the panel is
 * a real region, and keyboard focus drives the same states hover does.
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
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-obsidian py-20 text-paper md:py-28"
    >
      <div className="u-shell">
        <h2 className="u-eyebrow text-center text-[15px] font-extrabold tracking-[0.05em] text-paper md:text-[16px]">
          Explore our schools
        </h2>

        <ul
          className="relative mt-14 md:mt-20"
          onMouseLeave={() => setHovered(null)}
        >
          {SCHOOLS.map((school) => {
            const isActive = active === school.slug;
            const isOpen = open === school.slug;
            const panelId = `${uid}-${school.slug}`;

            return (
              <li
                key={school.slug}
                onMouseEnter={() => setHovered(school.slug)}
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
                    onFocus={() => setHovered(school.slug)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setOpen(isOpen ? null : school.slug)}
                    className="group relative z-10 grid w-full grid-cols-[1fr_auto] items-center gap-4 py-3.5 text-left md:gap-8 md:py-5"
                  >
                    <span className="u-grotesk block max-w-[18ch] text-[8vw] leading-[1.06] sm:text-[5vw] lg:max-w-none lg:text-[clamp(2rem,3.1vw,3rem)]">
                      {school.name}
                    </span>

                    <span className="flex items-center gap-4 md:gap-7">
                      <span className="hidden text-[13px] font-medium tracking-tight text-white/70 lg:inline xl:hidden">
                        {school.degrees.join(" · ")}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-white transition-transform duration-500 ease-out-expo",
                          isOpen && "rotate-180"
                        )}
                      />
                    </span>
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
                    <Image
                      src={school.image}
                      alt=""
                      fill
                      sizes="32rem"
                      className="object-cover"
                    />
                  </div>
                </figure>

                {/* ---- the panel ---- */}
                <div
                  id={panelId}
                  role="region"
                  aria-label={school.name}
                  inert={!isOpen}
                  className="relative z-10 grid overflow-hidden transition-[grid-template-rows] duration-500 ease-out-expo"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0">
                    <div className="grid gap-8 pb-10 pt-2 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-16 md:pb-14 xl:max-w-[58%]">
                      <div>
                        <p className="max-w-[46ch] text-[15px] leading-[1.75] text-white/75">
                          {school.description}
                        </p>
                        <a
                          href={school.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="u-pill mt-8 text-paper hover:bg-paper hover:text-obsidian"
                        >
                          Explore {school.name.split(" ")[0]}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </div>

                      <div>
                        <p className="u-eyebrow text-white/50">Degrees</p>
                        <ul className="mt-4 flex flex-col gap-2">
                          {school.degrees.map((d) => (
                            <li key={d} className="text-[15px] font-medium text-paper">
                              {d}
                            </li>
                          ))}
                        </ul>
                        <p className="u-eyebrow mt-8 text-white/50">Offered at</p>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {school.campuses.map((c) => (
                            <li
                              key={c}
                              className="rounded-full border border-white/25 px-3.5 py-1.5 text-[12px] font-medium"
                            >
                              {c}
                            </li>
                          ))}
                        </ul>
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
