"use client";

import { useEffect, useRef, useState } from "react";
import { APPLY_LINKS } from "@/lib/content/universities";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * The scratch band.
 *
 * A board sits at the bottom of the stack. Over it lies a canvas whose CSS
 * background is white and whose blend mode is `screen`. Screen against white
 * is white, so the band reads as blank paper; paint BLACK into the canvas and
 * screen against black is the backdrop, so wherever the brush has been the
 * board shows through. No masks, no clip paths, no second copy of the image.
 *
 * The brush is a core disc of about 52px with a dozen small satellites strung
 * out VERTICALLY, radii five to thirteen, breathing on one slow phase. The
 * vertical string gives the reveal ragged top and bottom edges and clean
 * horizontal sweeps. It does not heal — a trail that closes up behind you is
 * a nervous tic rather than an interaction.
 *
 * ---- the idle wave ----
 *
 * Left blank, a visitor who scrolls past without moving the cursor over the
 * band never learns there is anything to find. So the band takes the first two
 * strokes itself: a brush travels the width on a slow sine, twice, at two
 * heights. It is a demonstration and nothing else — it stops dead on the first
 * pointer event, and the cells it opens are NOT counted toward the threshold
 * that lifts the rest of the sheet, so it can neither finish the job nor bring
 * the flood on by itself.
 *
 * ---- on a phone ----
 *
 * A finger dragged across the band scrolls the page, and taking that away with
 * `touch-action: none` would trap the visitor inside a decorative section. So
 * a coarse pointer does not scratch at all: the sheet tears itself off once,
 * on a clock, the first time half the band is on screen. The section stays an
 * ordinary scrolling block before and after.
 *
 * ---- the last move ----
 *
 * On a fine pointer a coarse occupancy grid records which cells the brush has
 * touched, and once enough is open the rest goes.
 *
 * It floods rather than fades. The canvas is `screen` blended over white, so
 * dropping its opacity lifts the already-scratched areas back toward white on
 * the way down — the picture you had disappears and then comes back. Painting
 * a low-alpha black over the whole bitmap each frame is a no-op where the
 * board is already open, so what you opened does not move and the rest
 * arrives from where it stood.
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
 * How long the sheet takes to come off on a phone, in milliseconds.
 *
 * A clock rather than a fraction of a pin, because there is no pin any more.
 * This is the knob: the number has to stand in for a gesture that used to take
 * as long as the visitor's own thumb took to travel 80vh, which is a second
 * and a half to two seconds of deliberate scrolling. 900ms was half that and
 * read as a cut rather than a tear.
 */
const SWEEP_MS = 1800;

/**
 * The idle wave, on a fine pointer only.
 *
 * `WAIT` is measured from the band coming into view, not from load: the point
 * is for the visitor to watch it begin. `CYCLES` is per pass and is not a
 * round number on purpose — one and a half puts the brush at the opposite
 * side of the band from where it started, so the second pass reads as a
 * continuation rather than a repeat.
 */
const IDLE_WAIT = 650;
const IDLE_PASSES = 2;
const IDLE_MS = 4400;
const IDLE_CYCLES = 1.5;
/** Wave height, as a fraction of the stage. */
const IDLE_AMP = 0.13;
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

export default function ScratchReveal({
  image,
  imagePortrait,
}: {
  image: string;
  imagePortrait?: string;
}) {
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
      // ---- played once, on arrival ------------------------------------------
      // No pin, no scrub. This used to stick the stage to the top and scrub the
      // reveal against 80vh of spacer underneath it, which made the band the
      // one place on the page where scrolling did not move the page. Fine the
      // first time, when something is happening; on every pass after that it
      // was a screen and a half of dead travel over a board that was already
      // open, in both directions.
      //
      // The latch that fixed the re-covering made that worse rather than
      // better: the pin was still there, and now nothing happened inside it.
      //
      // So the tear is a one-shot on a clock instead, fired the first time the
      // band is properly on screen, and the section is an ordinary block
      // before and after. It is latched by construction — there is no second
      // run to guard against, and the observer's threshold buys the reveal
      // happening while the visitor is looking at it, rather than before they
      // arrive) is bought by the threshold on the observer instead.
      let frame = 0;
      let raf = 0;
      let done = false;

      /** Paint the sheet at `open`, 0 covered to 1 gone. */
      const draw = (open: number) => {
        const { w, h } = fit();
        ctx.clearRect(0, 0, w, h);
        if (open <= 0) return;
        if (open >= 1) {
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, w, h);
          return;
        }

        // The tear runs past the bottom edge so the last of the sheet leaves
        // the screen instead of dissolving in place.
        const edge = h * TEAR;
        const y = open * (h + edge);
        const solid = Math.max(0, y - edge);

        ctx.fillStyle = "#000";
        if (solid > 0) ctx.fillRect(0, 0, w, solid);

        // Soft trailing edge. Semi-transparent black over the canvas's own
        // white background is grey, and screen against grey lifts the board
        // rather than cutting to it, so the sheet tears rather than wipes.
        if (y > solid) {
          const g = ctx.createLinearGradient(0, solid, 0, y);
          g.addColorStop(0, "rgba(0,0,0,1)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, solid, w, y - solid);
        }
      };

      draw(0);

      const run = () => {
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = clamp01((now - t0) / SWEEP_MS);
          // Smoothstep, not the out-expo this started on. An out-expo is half
          // done in a tenth of its duration, which is right for something
          // ARRIVING — the masthead at the top of the page uses one — and
          // wrong for a sheet being drawn off, which is a steady pull with a
          // soft start and a soft stop. Under a thumb the old scrub was
          // linear in scroll, and this is the nearest curve to that which
          // still has ends.
          draw(t * t * (3 - 2 * t));
          if (t < 1) {
            raf = requestAnimationFrame(tick);
            return;
          }
          raf = 0;
          done = true;
          draw(1);
          setCleared(true);
          setProgress(1);
        };
        raf = requestAnimationFrame(tick);
      };

      // A resize clears the backing store, so whatever state the sheet is in
      // has to be redrawn. Mid-run the loop is about to do that anyway.
      const onResize = () => {
        if (frame || raf) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          draw(done ? 1 : 0);
        });
      };

      const io = new IntersectionObserver(
        ([entry]) => {
          // Half the band on screen, so the tear runs while it is being
          // looked at rather than finishing above the fold.
          if (!done && !raf && entry.intersectionRatio >= 0.5) run();
        },
        { threshold: [0, 0.5, 1] }
      );
      io.observe(st);

      window.addEventListener("resize", onResize);
      window.visualViewport?.addEventListener("resize", onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(st);
      return () => {
        cancelAnimationFrame(frame);
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("resize", onResize);
        window.visualViewport?.removeEventListener("resize", onResize);
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

    /**
     * Paint one brush stamp and, unless told otherwise, record the cells it
     * covers. The idle wave passes `count: false`: what it opens is a
     * demonstration, and a demonstration that counted toward the threshold
     * would be doing the visitor's scratching for them.
     */
    const stamp = (x: number, y: number, phase: number, count = true) => {
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

      if (!count || done || width === 0) return;
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

    /** The idle wave: cleared the instant the visitor touches the band. */
    let touched = false;
    let idleT0 = 0;
    let idlePass = -1;
    let idleFrom: { x: number; y: number } | null = null;

    const onPointer = (e: PointerEvent) => {
      touched = true;
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

      // ---- the wave that shows the band can be scratched --------------
      // Runs only while nobody has touched the stage, only while the band is
      // on screen (the observer below owns `running`), and never keeps score.
      if (!touched && !done && width > 0) {
        const now = performance.now();
        if (!idleT0) idleT0 = now;
        const el = now - idleT0 - IDLE_WAIT;

        if (el >= 0 && el < IDLE_MS) {
          const p = (el / IDLE_MS) * IDLE_PASSES;
          const pass = Math.min(IDLE_PASSES - 1, Math.floor(p));
          // A new pass restarts at the left edge. Without this the brush would
          // draw a straight line back across the band to get there.
          if (pass !== idlePass) {
            idlePass = pass;
            idleFrom = null;
          }
          const u = p - pass;
          const x = -CORE + u * (width + CORE * 2);
          const y =
            height * (0.42 + pass * 0.17) +
            Math.sin(u * Math.PI * 2 * IDLE_CYCLES) * height * IDLE_AMP;

          if (idleFrom) {
            const dx = x - idleFrom.x;
            const dy = y - idleFrom.y;
            const steps = Math.min(24, Math.max(1, Math.round(Math.hypot(dx, dy) / 14)));
            for (let i = 1; i <= steps; i++) {
              stamp(idleFrom.x + (dx * i) / steps, idleFrom.y + (dy * i) / steps, t + i * 0.2, false);
            }
          }
          idleFrom = { x, y };
          t += 0.06;
        }
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
    /* An ordinary block, on every pointer.
       It used to pin on a coarse one: the stage stuck to the top and a spacer
       underneath gave the reveal 80vh of travel to be scrubbed against. That
       spacer is gone along with the scrub, and with it the one place on the
       page where scrolling stopped moving the page. */
    <section
      ref={section}
      id="build"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative bg-paper"
    >
      <div
        ref={stage}
        className="relative isolate flex flex-col justify-end overflow-hidden bg-paper pointer-coarse:min-h-dvh"
      >
        {/* ---- the board, bottom of the stack ----
            One picture, full bleed. Was a two-by-four grid of eight; a contact
            sheet is eight pictures of a place in an order nobody chose, and
            the sheet reads better coming off one frame.

            Art-directed rather than merely responsive, which is why this is a
            `<picture>` and not next/image. The board is a landscape
            arrangement and a phone is a tall frame: `object-cover` on the wide
            crop throws away the left two thirds, which is where most of the
            photographs are. Two files, one fetch, the browser picking. Both
            are hand-sized webp already, so the optimiser had nothing left to
            do here anyway. */}
        <picture>
          {imagePortrait && <source media="(max-width: 767px)" srcSet={imagePortrait} />}
          <img
            src={image}
            alt=""
            aria-hidden
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>

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
            phone the copy is bottom-anchored under a full-bleed board, so it
            runs bottom to top and the pictures keep the top: a left-to-right
            wash on a 390px screen is just an opaque band over the entire
            reveal.

            Both were tuned for type and against the picture, and it showed.
            The phone's held a solid white third and was still at 0.9 halfway
            up; the desktop's sat at 0.85 across the middle of a 52% column.
            The board a visitor has just opened was arriving pale, and a reveal
            you wait for should not hand back a washed photograph.

            So both decay early, and each holds full opacity only over the
            sliver the copy actually sits on: the bottom twelfth on a phone,
            the first third of the column on a desktop. What buys the contrast
            back is not the wash but the halo on the type itself, a few lines
            down — paid for over the letterforms rather than over the whole
            board. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden pointer-coarse:block"
          style={{
            background:
              "linear-gradient(to top, #fff 0%, #fff 8%, rgba(255,255,255,0.78) 24%, rgba(255,255,255,0.46) 42%, rgba(255,255,255,0.16) 62%, rgba(255,255,255,0) 80%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full pointer-coarse:hidden md:w-[56%] lg:w-[48%]"
          style={{
            background:
              "linear-gradient(to right, #fff 0%, rgba(255,255,255,0.95) 32%, rgba(255,255,255,0.6) 62%, rgba(255,255,255,0) 100%)",
          }}
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
          {/* A white glow rather than more wash. The washes above were pulled
              back hard so the board actually shows, which leaves the two
              largest pieces of type sitting on photographs at the far end of
              their gradients. A halo carried by the letterforms themselves
              buys the contrast back over exactly the pixels that need it,
              instead of spending another twenty percent of the picture on a
              rectangle. Invisible before the sheet comes off: white on white.

              Three stops rather than one. A single wide blur is a smudge that
              lifts everything nearby by a little; a tight opaque core with two
              wider falloffs behind it reads as the letter sitting ON the
              board. A phone gets the tighter, harder version, because its copy
              is bottom-anchored over the busiest part of the picture where the
              desktop's sits on the palest. */}
          <p className="select-none text-crimson [text-shadow:0_0_6px_#fff,0_0_16px_#fff,0_1px_34px_rgba(255,255,255,0.9)] pointer-coarse:[text-shadow:0_0_5px_#fff,0_0_11px_#fff,0_0_22px_rgba(255,255,255,0.95)]">
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

          {/* Two sentences, two weights. The first is the claim and the second
              is the invitation, and they were one paragraph until the copy
              arrived written as two lines — so they are set as two, the second
              smaller and closing on the line the whole campaign is named for. */}
          <p className="u-display mt-5 max-w-[30ch] text-[6.4vw] leading-[1.15] text-ink [text-shadow:0_0_6px_#fff,0_0_15px_#fff,0_1px_30px_rgba(255,255,255,0.9)] pointer-coarse:[text-shadow:0_0_5px_#fff,0_0_10px_#fff,0_0_20px_rgba(255,255,255,0.95)] sm:text-[4.6vw] md:mt-6 md:leading-[1.06] lg:max-w-[24ch] lg:text-[clamp(2.5rem,3.8vw,3.75rem)]">
            26 Years. Thousands of Stories. One Legacy of Building Futures.
          </p>

          <p className="u-display-strong mt-4 max-w-[34ch] text-[4.6vw] leading-[1.25] text-crimson [text-shadow:0_0_6px_#fff,0_0_15px_#fff,0_1px_30px_rgba(255,255,255,0.9)] pointer-coarse:[text-shadow:0_0_5px_#fff,0_0_10px_#fff,0_0_20px_rgba(255,255,255,0.95)] sm:text-[3.2vw] md:mt-5 lg:max-w-[30ch] lg:text-[clamp(1.6rem,2.3vw,2.25rem)]">
            Find your programme. Find your place. Build Your World.
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
    </section>
  );
}
