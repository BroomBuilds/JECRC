"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { APPLY_LINKS } from "@/lib/content/universities";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * The scratch band.
 *
 * A collage sits at the bottom of the stack. Over it lies a canvas whose CSS
 * background is white and whose blend mode is `screen`. Screen against white is
 * white, so the band reads as blank paper; paint BLACK into the canvas and
 * screen against black is the backdrop, so wherever the brush has been, the
 * collage shows through. No masks, no clip paths, no second copy of the images.
 *
 * The brush is a core disc of about 52px with a dozen small satellites strung
 * out VERTICALLY, radii five to thirteen, all breathing on one slow phase. The
 * vertical string is what gives the reveal ragged top and bottom edges and
 * clean horizontal sweeps.
 *
 * Two things it deliberately does NOT do:
 *
 *   - It does not heal. An earlier pass washed the canvas with a low-alpha
 *     white each frame so the trail closed up behind you. Scratching something
 *     that repairs itself is a nervous tic, not an interaction.
 *   - It does not scratch itself. There is no idle path wandering across the
 *     band. The visitor is the one holding the coin.
 *
 * ---- and on a phone ----
 *
 * A finger dragged across the band scrolls the page, and taking that away with
 * `touch-action: none` would trap the visitor inside a decorative section. So a
 * coarse pointer gets the honest equivalent: the band PINS, exactly the way the
 * film above it pins, and the sheet lifts as you scrub.
 *
 * That pin is the whole point. An earlier pass drove the reveal off the band's
 * ordinary travel through the viewport, which meant it was already most of the
 * way open by the time it was centred and readable: the visitor arrived after
 * the event and the interaction read as broken. Pinned, the reveal happens
 * while they are looking at it, it runs both ways under the thumb, and it is
 * the same gesture and the same grammar as the tour.
 *
 * On a fine pointer it keeps score instead. A coarse occupancy grid records
 * which cells the brush has touched, and once enough of the band is open the
 * rest goes.
 *
 * How that last move happens matters. Fading the canvas out looks like the
 * obvious answer and is wrong: the canvas is `screen` blended over white, so
 * dropping its opacity lifts the ALREADY-scratched areas back toward white on
 * the way down before they return at zero. The picture you had disappears and
 * then comes back, which is exactly the flinch you feel.
 *
 * So the canvas never changes opacity. It floods: a low-alpha black is painted
 * over the whole bitmap each frame until the sheet is black everywhere.
 * Painting black over black is a no-op, so what you already opened does not
 * move at all, and the rest arrives from where it stood.
 */

/** Core brush radius, before the breathing modulation. */
const CORE = 52;
const SATELLITES = 12;
/** How far up and down the satellites string out from the core. */
const SPREAD = 68;
/** Occupancy grid, in cells. Coarse on purpose: this is a progress bar. */
const COLS = 26;
const ROWS = 14;
/** Fraction of the grid that has to be opened before the rest falls away. */
const THRESHOLD = 0.42;
/**
 * Per-frame alpha of the black flood once the threshold is reached. Coverage
 * goes 1 - (1 - a)^n, so 0.055 is opaque in about a second at 60fps.
 */
const FLOOD = 0.055;

/**
 * Fraction of the pin spent opening the sheet, on a phone. The remainder is
 * the beat where the collage is simply there to be looked at before the band
 * lets go: a reveal that finishes on the last pixel of its own pin is a reveal
 * nobody sees finished.
 */
const SWEEP = 0.95;
/** Depth of the soft edge on the travelling tear, as a fraction of the stage. */
const TEAR = 0.12;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

type Sat = { offset: number; radius: number; phase: number };

const makeSatellites = (): Sat[] =>
  Array.from({ length: SATELLITES }, (_, i) => {
    // Deterministic rather than random: the brush should look the same on every
    // load, and a seeded shape is easier to tune than a lucky one.
    const t = (i + 1) / (SATELLITES + 1);
    const swing = Math.sin(t * Math.PI * 2.7);
    return {
      offset: (t * 2 - 1) * SPREAD + swing * 12,
      radius: 5 + Math.abs(Math.cos(t * Math.PI * 3.1)) * 8,
      phase: t * Math.PI * 2,
    };
  });

export default function ScratchReveal({ images }: { images: string[] }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cleared, setCleared] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sec = section.current;
    const st = stage.current;
    const cv = canvas.current;
    if (!sec || !st || !cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    /** Match the bitmap to the stage box. Returns the CSS-pixel size. */
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = st.clientWidth;
      const h = st.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { w, h, resized: true };
      }
      return { w, h, resized: false };
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Nothing to scratch: hand over the picture and skip the apparatus. The
      // sheet is painted out rather than hidden, so the same code path draws
      // it either way. Deferred a frame so this is not a synchronous setState
      // in an effect body, which would cascade a render on every mount.
      const paint = () => {
        const { w, h } = fit();
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, w, h);
      };
      const frame = requestAnimationFrame(() => {
        paint();
        setCleared(true);
        setProgress(1);
      });
      window.addEventListener("resize", paint);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", paint);
      };
    }

    if (coarse) {
      // ---- pinned, scrubbed ------------------------------------------------
      // Progress is the stage's travel inside its own container, which is the
      // section's padding-bottom and nothing else. Measuring it that way keeps
      // it independent of `innerHeight`, so a URL bar sliding away cannot move
      // the reveal the way it used to move the film.
      let frame = 0;

      const paint = () => {
        frame = 0;
        const r = sec.getBoundingClientRect();
        const { w, h } = fit();
        const travel = r.height - h;
        ctx.clearRect(0, 0, w, h);
        if (travel <= 0) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, w, h);
          return;
        }
        const open = clamp01(clamp01(-r.top / travel) / SWEEP);
        if (open <= 0) return;

        // The tear runs past the bottom edge so the last of the sheet leaves
        // the screen instead of dissolving in place.
        const edge = h * TEAR;
        const y = open * (h + edge);
        const solid = Math.max(0, y - edge);

        ctx.fillStyle = "#000";
        if (solid > 0) ctx.fillRect(0, 0, w, solid);

        // Soft trailing edge. Semi-transparent black over the canvas's own
        // white background is grey, and screen against grey lifts the collage
        // rather than cutting to it, so the sheet tears rather than wipes.
        if (y > solid) {
          const g = ctx.createLinearGradient(0, solid, 0, y);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, solid, w, y - solid);
        }
        // No setState here on purpose. This runs on every scrolled frame, and
        // the only thing `progress` drives is the fine-pointer prompt, which
        // is not rendered on a coarse one.
      };

      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(paint);
      };
      paint();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.visualViewport?.addEventListener("resize", onScroll);
      const ro = new ResizeObserver(onScroll);
      ro.observe(st);
      return () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        window.visualViewport?.removeEventListener("resize", onScroll);
      };
    }

    const sats = makeSatellites();
    const grid = new Uint8Array(COLS * ROWS);
    let opened = 0;
    let done = false;

    let width = 0;
    let height = 0;

    const resize = () => {
      const { w, h, resized } = fit();
      width = w;
      height = h;
      if (!resized) return;
      // A resize clears the bitmap. Once the flood has run the answer is the
      // whole sheet; before that, replay the opened cells rather than losing
      // the visitor's work.
      if (done) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);
        return;
      }
      if (opened) {
        ctx.fillStyle = "#000";
        const cw = width / COLS;
        const ch = height / ROWS;
        for (let i = 0; i < grid.length; i++) {
          if (!grid[i]) continue;
          ctx.fillRect((i % COLS) * cw, Math.floor(i / COLS) * ch, cw + 1, ch + 1);
        }
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(st);

    /** Paint one brush stamp and record the cells it covers. */
    const stamp = (x: number, y: number, phase: number) => {
      const breathe = 1 + Math.sin(phase) * 0.09;
      const r = CORE * breathe;

      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      for (const s of sats) {
        ctx.beginPath();
        ctx.arc(x, y + s.offset, s.radius * (1 + Math.sin(phase + s.phase) * 0.22), 0, Math.PI * 2);
        ctx.fill();
      }

      if (done || width === 0) return;
      // Mark the grid over the core's box plus the satellites' vertical reach.
      const cw = width / COLS;
      const ch = height / ROWS;
      const c0 = Math.max(0, Math.floor((x - r) / cw));
      const c1 = Math.min(COLS - 1, Math.floor((x + r) / cw));
      const r0 = Math.max(0, Math.floor((y - SPREAD) / ch));
      const r1 = Math.min(ROWS - 1, Math.floor((y + SPREAD) / ch));
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const k = row * COLS + col;
          if (!grid[k]) {
            grid[k] = 1;
            opened++;
          }
        }
      }
    };

    let px = 0;
    let py = 0;
    let lastX = 0;
    let lastY = 0;
    let have = false;
    let dirty = false;

    const onPointer = (e: PointerEvent) => {
      const r = st.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!have) {
        lastX = px;
        lastY = py;
        have = true;
      }
      dirty = true;
    };
    const onLeave = () => {
      have = false;
    };

    st.addEventListener("pointermove", onPointer, { passive: true });
    st.addEventListener("pointerdown", onPointer, { passive: true });
    st.addEventListener("pointerleave", onLeave, { passive: true });

    let raf = 0;
    let running = false;
    let t = 0;
    let flooding = false;
    let floodFrames = 0;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      // Threshold reached: stop taking input and wash the rest of the sheet to
      // black. Black over black changes nothing, so everything already opened
      // holds still while the remainder arrives.
      if (flooding) {
        ctx.fillStyle = `rgba(0,0,0,${FLOOD})`;
        ctx.fillRect(0, 0, width, height);
        floodFrames++;
        // 1 - (1 - FLOOD)^n passes 0.999 well before this, and one opaque
        // pass at the end guarantees no residue on a slow frame budget.
        if (floodFrames > 90) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, width, height);
          done = true;
          running = false;
          cancelAnimationFrame(raf);
        }
        return;
      }

      if (!have || !dirty || done) return;

      dirty = false;
      t += 0.06;

      // Interpolate from the previous point, so a fast flick draws a stroke
      // rather than a dotted line.
      const dx = px - lastX;
      const dy = py - lastY;
      const steps = Math.min(24, Math.max(1, Math.round(Math.hypot(dx, dy) / 14)));
      for (let i = 1; i <= steps; i++) {
        stamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps, t + i * 0.2);
      }
      lastX = px;
      lastY = py;

      const ratio = opened / grid.length;
      setProgress(Math.min(1, ratio / THRESHOLD));
      if (ratio >= THRESHOLD) {
        flooding = true;
        setCleared(true);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (done) return;
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(st);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      st.removeEventListener("pointermove", onPointer);
      st.removeEventListener("pointerdown", onPointer);
      st.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    /* The spacer below the stage IS the pin: the stage sticks to the top and
       the section keeps travelling for another 85vh underneath it, which is
       the scroll the sheet is scrubbed against. On a fine pointer the spacer
       is not rendered, the stage has nowhere to travel, and the coin does the
       work instead.

       It has to be a real box and not padding on the section. A sticky
       element is constrained to its containing block, which is the CONTENT
       box of the nearest block-container ancestor: padding-bottom sits
       outside it, so `pb-[85vh]` here made the section taller and gave the
       pin exactly zero travel. */
    <section
      ref={section}
      id="build"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative bg-paper"
    >
      <div
        ref={stage}
        className="relative isolate flex flex-col justify-end overflow-hidden bg-paper pointer-coarse:sticky pointer-coarse:top-0 pointer-coarse:min-h-dvh"
      >
        {/* ---- the collage, bottom of the stack ---- */}
        <div aria-hidden className="absolute inset-0 grid grid-cols-2 md:grid-cols-4">
          {images.map((src, i) => (
            <div key={src + i} className="relative">
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* ---- the paper, and the brush that takes it away ----
            Screen against the white background is white, so this reads as blank
            until something paints black into it. Its opacity is never animated,
            for the reason in the note at the top of this file. */}
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 h-full w-full bg-paper"
          style={{ mixBlendMode: "screen" }}
        />

        {/* ---- type protection ----
            Once the sheet is gone the copy is sitting on photographs.

            Two different washes, because the two layouts read in different
            directions. On a desktop the copy holds the left column, so the
            wash runs left to right and the pictures keep the right half. On a
            phone the copy is bottom-anchored under a full-bleed collage, so it
            runs bottom to top and the pictures keep the top third: a
            left-to-right wash on a 390px screen is just an opaque band over
            the entire reveal. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden pointer-coarse:block"
          style={{
            background:
              "linear-gradient(to top, #fff 0%, #fff 32%, rgba(255,255,255,0.9) 52%, rgba(255,255,255,0.55) 74%, rgba(255,255,255,0.12) 92%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full bg-linear-to-r from-paper via-paper/85 to-transparent pointer-coarse:hidden md:w-[62%] lg:w-[52%]"
        />

        {/* ---- content ---- */}
        <div className="relative z-10 u-shell pb-32 pt-20 md:py-32 lg:py-40">
          {/* The name, set the way the lockup sets it: the word over a
              letterspaced second line at roughly the same width. An earlier pass
              had a lowercase "jecrc" in the grotesk, which read as a fashion
              logotype rather than the university's own mark.

              Two spans in one paragraph with the accessible name spelled out, so
              it is announced as "JECRC University" and not as two fragments. */}
          {/* The accessible name is a hidden span rather than an aria-label:
              `aria-label` is prohibited on a paragraph, and a screen reader
              given two decorative fragments would announce "JECRC" and
              "UNIVERSITY" as separate strings. */}
          <p className="select-none text-crimson">
            <span className="sr-only">JECRC University</span>
            {/* The second line is 0.4706 of the first, the cap-height ratio
                measured off the lockup. The J descends in this face, so the two
                lines are not closed up as tightly as a grotesk would allow. */}
            <span aria-hidden className="u-wordmark block text-[14vw] leading-[0.92] lg:text-[13vw]">
              JECRC
            </span>
            <span
              aria-hidden
              className="u-wordmark-sub block text-[6.6vw] leading-[1.05] lg:text-[6.1vw]"
            >
              UNIVERSITY
            </span>
          </p>

          <p className="u-display mt-5 max-w-[30ch] text-[6.4vw] leading-[1.15] text-ink sm:text-[4.6vw] md:mt-6 md:leading-[1.06] lg:max-w-[24ch] lg:text-[clamp(2.5rem,3.8vw,3.75rem)]">
            Twenty-six years of building people who build things. Find the campus, the school and
            the year that fits.
          </p>

          {/* Stacked and full width on a phone, with the first campus carrying
              the weight. Three identical outline pills in a row is three equal
              choices and no recommendation; on a screen this narrow that reads
              as a form, not an invitation. */}
          <div className="mt-8 flex flex-col gap-2.5 md:mt-12 md:flex-row md:flex-wrap md:gap-3">
            {APPLY_LINKS.map((link, i) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  i === 0
                    ? "u-pill w-full border-crimson bg-crimson text-paper hover:bg-crimson-deep md:w-auto md:border-ink md:bg-paper md:text-ink md:hover:bg-ink md:hover:text-paper"
                    : "u-pill w-full border-ink/20 bg-paper/80 text-ink hover:bg-ink hover:text-paper md:w-auto md:border-ink md:bg-paper"
                }
              >
                Apply · {link.label}
                <ArrowRight className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* ---- the prompt, and how far through you are ----
              Fine pointers only. On a phone the sheet lifts itself as the band
              is scrubbed, so a line of instructions is telling the visitor to
              do the thing that is already happening. */}
          <div
            aria-hidden
            className="mt-14 hidden items-center gap-4 transition-opacity duration-700 sm:flex"
            style={{ opacity: cleared ? 0 : 1 }}
          >
            <span className="u-eyebrow whitespace-nowrap text-quiet">Scratch to see the place</span>
            <span className="h-px w-full max-w-40 bg-ink/15">
              <span
                className="block h-px origin-left bg-crimson transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${progress})` }}
              />
            </span>
          </div>
        </div>
      </div>

      <div aria-hidden className="hidden h-[80vh] pointer-coarse:block" />
    </section>
  );
}
