"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ANNOUNCEMENT } from "@/lib/content/announcement";
import { LOGO } from "@/lib/content/site";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * Two new universities.
 *
 * The band carries an announcement whose substance is not public yet, so it is
 * built around the absence rather than trying to hide it. Every field reads
 * "To be announced" at the size the real answer will occupy: the shape of the
 * news is already on the page, waiting to be filled.
 *
 * Laid out as one row, not a stack. The previous pass ran a narrow headline
 * column down the left with the plates below it and left most of the band
 * empty; here the headline, the paragraph and the two plates share a single
 * four-column grid, and the vertical padding is cut to match. Same content,
 * roughly half the height.
 *
 * Red, with a pointer-tracked light so the ground has a direction, sitting
 * between two pale sections. Returns null when the announcement is off.
 *
 * Under the row, the medical college. It is the one part of what is next that
 * is not a placeholder — designed, named on its own elevation, and drawn — so
 * it carries the pictures while the two universities keep the plates. Putting
 * it above them would be wrong: the band's headline is about the group getting
 * bigger, and a building already under way is the evidence for that claim
 * rather than the claim itself.
 */
export default function ComingSoon() {
  const band = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);

  // The pointer light is written straight to style rather than through state:
  // it changes on every pointermove and React owns nothing else about it.
  useEffect(() => {
    const el = band.current;
    const g = glow.current;
    if (!el || !g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      g.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!ANNOUNCEMENT.live) return null;

  return (
    <section
      ref={band}
      id="whats-next"
      aria-labelledby="coming-soon-title"
      data-cursor-invert
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative isolate overflow-hidden bg-crimson text-paper"
    >
      {/* ---- depth ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            "linear-gradient(118deg, rgba(255,255,255,0.2) 0%, transparent 34%, transparent 64%, rgba(0,0,0,0.3) 100%)",
        }}
      />
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute -left-[20rem] -top-[20rem] h-[40rem] w-[40rem] opacity-70 mix-blend-screen blur-[90px] will-change-transform"
        style={{ background: "radial-gradient(circle, rgba(255,140,130,0.55) 0%, transparent 68%)" }}
      />

      <div className="u-shell relative py-14 md:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)] lg:items-center lg:gap-16">
          {/* ---- the news ---- */}
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
              className="u-display mt-5 max-w-[13ch] text-[1.95rem] sm:mt-6 sm:text-[2.7rem] lg:text-[clamp(2.75rem,3.8vw,4rem)]"
            >
              {ANNOUNCEMENT.title}{" "}
              <span className="u-display-strong">{ANNOUNCEMENT.titleAccent}</span>
            </h2>

            <p
              data-reveal
              style={{ "--reveal-delay": "130ms" } as React.CSSProperties}
              className="mt-6 max-w-[42ch] text-[15.5px] leading-[1.65] text-white/85 md:text-[16.5px]"
            >
              {ANNOUNCEMENT.detail}
            </p>

            <a
              data-reveal
              style={{ "--reveal-delay": "190ms" } as React.CSSProperties}
              href={ANNOUNCEMENT.cta.href}
              className="u-pill group mt-8 border-paper bg-paper text-crimson hover:bg-crimson-deep hover:border-crimson-deep hover:text-paper"
            >
              {ANNOUNCEMENT.cta.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* ---- the two plates ---- */}
          <ul className="grid gap-4 sm:grid-cols-2">
            {ANNOUNCEMENT.campuses.map((c, i) => (
              <li
                key={c.no}
                data-reveal
                style={{ "--reveal-delay": `${140 + i * 100}ms` } as React.CSSProperties}
                className="group relative overflow-hidden rounded-xl border border-white/25 bg-white/[0.08] p-6 transition-colors duration-500 hover:border-white/55 hover:bg-white/[0.14]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="u-eyebrow text-white/70">{ANNOUNCEMENT.kicker}</p>
                  <span aria-hidden className="u-figure text-[1.5rem] text-white/25">
                    {c.no}
                  </span>
                </div>

                <h3 className="u-display mt-4 max-w-[10ch] text-[1.3rem] leading-[1.15] md:text-[1.8rem]">
                  {c.name}
                </h3>

                <dl className="mt-6 flex flex-col">
                  {c.facts.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-baseline justify-between gap-3 border-t border-white/20 py-3"
                    >
                      <dt className="u-eyebrow text-white/60">{f.label}</dt>
                      <dd className="text-[13.5px] font-semibold text-paper">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>

        {/* ---- the medical college ----
            The renders are the only real pictures this band has, so they get
            the room: the elevation full width of its column, the two closer
            views under it. Captioned as visualisations rather than passed off
            as photographs, because they are drawings of a building that is not
            finished and the section's whole voice is that it does not pretend
            to know things yet. */}
        <div className="mt-14 border-t border-white/20 pt-12 md:mt-16 md:pt-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:items-start lg:gap-16">
            <div>
              {/* The reversed mark, same artwork the tour uses.

                  The published version is black type and a maroon shield built
                  for white paper: on this band the maroon is very nearly the
                  band's own colour, and it was the wordmark carrying the whole
                  logo on its own. Reversed, the shield reads again — see
                  `scripts/make-hospital-mark.mjs`. */}
              <Image
                data-reveal
                src={LOGO.hospitalMarkReversed}
                alt="JECRC Hospital"
                width={704}
                height={274}
                className="mb-6 h-10 w-auto sm:h-12"
              />
              <span data-reveal className="u-eyebrow text-white/70">
                {ANNOUNCEMENT.medical.eyebrow}
              </span>

              <h3
                data-reveal
                style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
                className="u-display mt-4 max-w-[14ch] text-[1.6rem] leading-[1.1] sm:text-[2.1rem] lg:text-[2.4rem]"
              >
                {ANNOUNCEMENT.medical.name}
              </h3>

              <p
                data-reveal
                style={{ "--reveal-delay": "130ms" } as React.CSSProperties}
                className="mt-5 max-w-[40ch] text-[15px] leading-[1.65] text-white/85"
              >
                {ANNOUNCEMENT.medical.detail}
              </p>

              <p className="u-eyebrow mt-6 text-white/45">
                {ANNOUNCEMENT.medical.place} · {ANNOUNCEMENT.medical.credit}
              </p>
            </div>

            <div
              data-reveal
              style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
              className="grid gap-3 sm:grid-cols-2"
            >
              {ANNOUNCEMENT.medical.views.map((v, i) => (
                <figure
                  key={v.src}
                  className={`relative overflow-hidden rounded-xl ring-1 ring-white/25 ${
                    i === 0 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="relative w-full" style={{ aspectRatio: i === 0 ? "16 / 9" : "16 / 10" }}>
                    <Image
                      src={v.src}
                      alt={`${ANNOUNCEMENT.medical.name}, ${v.label.toLowerCase()}`}
                      fill
                      sizes="(min-width: 1024px) 46vw, (min-width: 640px) 44vw, 92vw"
                      className="object-cover"
                    />
                  </div>
                  {/* The label sits on the picture rather than under it: three
                      captions in a row below three frames of different heights
                      is a ragged line nobody reads. */}
                  <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 to-transparent px-4 pb-3 pt-10">
                    <span className="u-eyebrow text-white/80">{v.label}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
