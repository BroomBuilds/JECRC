"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import manifest from "@/lib/tour-manifest.json";
import { APPLY_LINKS } from "@/lib/content/universities";
import { BRAND, LOGO } from "@/lib/content/site";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * Scroll length of the tour.
 *
 * Set in CSS rather than here so it can differ by screen: 1500vh on a desktop
 * is fifteen screens of film, and the same number on a 780px phone is a wall
 * the visitor has to climb before reaching anything else. See `--tour-vh` in
 * globals.css.
 */
export const TOUR_HEIGHT = "var(--tour-vh)";

export type Caption = {
  /** [fade-in point, fade-out point] as fractions of the tour, 0 to 1. */
  at: [number, number];
  eyebrow?: string;
  title: string;
  sub?: string;
  tagline?: string;
  /** "hero" opens with the crest, "apply" closes with the three portals. */
  variant?: "hero" | "apply";
};

/**
 * A single apply stamp riding along mid-film.
 *
 * `campus` indexes APPLY_LINKS. There is no position field: every stamp lands
 * on the same anchor, and only the moment changes.
 */
export type ApplyBeat = {
  /** [fade-in point, fade-out point] as fractions of the tour, 0 to 1. */
  at: [number, number];
  campus: number;
};

type Props = { captions?: Caption[]; applyBeats?: ApplyBeat[] };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smooth = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * Scroll-driven film, rendered as an image sequence on a canvas.
 *
 * Not a <video> scrubbed with currentTime. Seeking compressed video is
 * asymmetric: forward is one frame of decode, backward means jumping to the
 * previous keyframe and decoding forward to the target, which is why video
 * scrubbing feels fine going down and awful coming back up. A decoded image
 * sequence has no keyframes and no decoder state, so frame N costs the same
 * whichever direction you arrived from.
 *
 * Frames come from `npm run tour:build <video>`. The full write-up, including
 * the measurements behind this choice, is in TOUR.md.
 */
export default function ScrollTour({ captions = [], applyBeats = [] }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sealRefs = useRef<(SVGSVGElement | null)[]>([]);
  const uid = useId();
  const [pct, setPct] = useState(0);
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    const sec = section.current;
    const cv = canvas.current;
    if (!sec || !cv) return;

    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { count, base, format, pad } = manifest;

    // ---- pick the source width ------------------------------------------
    // Capped at 1.75: a 3x phone does not need a 4,000px source for a
    // full-bleed, soft-focus film, and the memory saved matters more than the
    // sharpness lost.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const needed = window.innerWidth * dpr;
    const sizes = [...manifest.sizes].sort((a, b) => a.width - b.width);
    const chosen = sizes.find((s) => s.width >= needed * 0.85) ?? sizes[sizes.length - 1];
    const url = (i: number) => `${base}/${chosen.dir}/f${String(i + 1).padStart(pad, "0")}.${format}`;

    // Every second frame on a phone. The tour is by far the heaviest thing on
    // the page, most of the traffic is mobile, and at the pixel-per-frame this
    // runs at, half the sequence still reads as continuous motion: the scroll
    // length halves alongside it, so the pixels between frames barely change.
    const step = window.innerWidth < 768 ? 2 : 1;
    /** Frame indices actually fetched, in order. */
    const track: number[] = [];
    for (let i = 0; i < count; i += step) track.push(i);
    if (track[track.length - 1] !== count - 1) track.push(count - 1);
    const frames = track.length;

    // ---- frame store -----------------------------------------------------
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    const ready: boolean[] = new Array(count).fill(false);
    /** Requested, in TRACK positions rather than frame indices. */
    const asked = new Uint8Array(frames);
    let loadedCount = 0;
    /** Track position under the playhead right now. */
    let cursor = 0;
    let inflight = 0;

    // ---- what to fetch, and when -----------------------------------------
    //
    // The whole film is thirty-odd megabytes at the desktop size. Fetching all
    // of it on load is the single most expensive thing this page could do, and
    // most of it would be spent on visitors who never scroll past the second
    // beat. So the sequence is fetched in three phases, and only the first one
    // is unconditional:
    //
    //   PRIME    a wide stride across the entire film, about thirty frames,
    //            requested immediately. Sparse, but every scroll position has
    //            a real picture within half a second of itself, so the film is
    //            usable end to end for well under a megabyte.
    //   COARSE   one more pass at twice the density, so a jump to an
    //            arbitrary position lands on something close to right.
    //   WINDOW   everything else, and never more than a viewport and a half of
    //            film either side of where the visitor actually is. Scroll on
    //            and the window travels with you; stop, and it stops.
    //
    // Both of the last two wait for a first gesture — a scroll, a wheel, a key.
    // Nothing else is evidence that anyone intends to watch a thirty-second
    // film, and a tab that is opened and abandoned should not cost three
    // megabytes to abandon. The gesture that opens them is the same gesture
    // that starts the film, so the window is already filling forward by the
    // time the first frame changes.
    //
    // A tab opened and abandoned pays for PRIME. A visitor who watches the
    // whole film pays for the whole film, one window at a time, which is also
    // the only visitor for whom that is worth paying.
    const PRIME = 30;
    /** Track positions to keep filled ahead of the cursor, and behind it. */
    const AHEAD = 90;
    const BEHIND = 40;

    const strides: number[] = [];
    for (let s = Math.max(1, 2 ** Math.round(Math.log2(frames / PRIME))); s >= 1; s = s >> 1) {
      strides.push(s);
    }

    /** Track positions in coarse-to-fine order. */
    const plan: number[] = [];
    const planned = new Uint8Array(frames);
    for (const stride of strides) {
      for (let k = 0; k < frames; k += stride) {
        if (!planned[k]) {
          planned[k] = 1;
          plan.push(k);
        }
      }
    }
    const PRIME_COUNT = Math.ceil(frames / strides[0]);
    const EAGER = PRIME_COUNT + (strides[1] ? Math.ceil(frames / strides[1]) : 0);

    let planAt = 0;
    let eagerLimit = PRIME_COUNT;
    let windowOpen = false;

    /** Next track position worth fetching, or -1 when there is nothing to do. */
    const pick = () => {
      while (planAt < eagerLimit) {
        const k = plan[planAt++];
        if (!asked[k]) return k;
      }
      if (!windowOpen) return -1;
      // Forward first: down is the direction of travel, and a frame behind the
      // playhead is one the visitor has already seen.
      for (let d = 0; d <= AHEAD; d++) {
        let k = cursor + d;
        if (k < frames && !asked[k]) return k;
        if (d > 0 && d <= BEHIND) {
          k = cursor - d;
          if (k >= 0 && !asked[k]) return k;
        }
      }
      return -1;
    };

    let disposed = false;
    let dirty = true;

    const pump = () => {
      // Eight while the poster is still the largest paint on the page, sixteen
      // once it is not. Over a real connection every request pays a round trip
      // that localhost does not, so a deep queue hides that latency instead of
      // paying it serially; HTTP/2 multiplexes it onto one connection.
      const concurrency = windowOpen ? 16 : 8;
      while (!disposed && inflight < concurrency) {
        const k = pick();
        if (k < 0) return;
        asked[k] = 1;
        const i = track[k];
        inflight++;

        const img = new window.Image();
        img.decoding = "async";

        const settle = () => {
          images[i] = img;
          ready[i] = true;
          loadedCount++;
          inflight--;
          if (loadedCount <= PRIME_COUNT) {
            setPct(Math.min(100, Math.round((loadedCount / PRIME_COUNT) * 100)));
          }
          // The prime pass covers the timeline end to end, so a quarter of it
          // is already enough to show a real picture wherever the visitor is.
          // Waiting for all of them would hold the poster over a canvas that
          // has something better to show.
          if (!disposed && loadedCount >= Math.min(frames, Math.ceil(PRIME_COUNT / 4))) {
            setPrimed(true);
          }
          dirty = true;
          pump();
        };

        img.onload = () => {
          // onload only means the bytes arrived. The first drawImage of an
          // undecoded image decodes it synchronously inside the rAF callback,
          // a 5 to 15ms stall in a 16.7ms budget. Decoding here moves that off
          // the paint path.
          if (typeof img.decode === "function") img.decode().then(settle, settle);
          else settle();
        };
        img.onerror = () => {
          inflight--;
          pump();
        };
        img.src = url(i);
      }
    };

    /** First gesture: open the coarse pass and the travelling window. */
    const open = () => {
      if (disposed || windowOpen) return;
      windowOpen = true;
      eagerLimit = EAGER;
      pump();
    };
    const GESTURES = ["scroll", "wheel", "keydown", "touchstart"] as const;
    for (const g of GESTURES) {
      window.addEventListener(g, open, { once: true, passive: true });
    }

    // ---- drawing ---------------------------------------------------------
    let lastDrawn = -1;
    let lastImg: HTMLImageElement | undefined;

    // Capped rather than open-ended. With the sequence loaded sparsely there is
    // always something within half a stride, and an uncapped walk would scan
    // the whole array on every paint in the gap before the prime pass lands.
    const REACH = 64;

    const nearest = (i: number) => {
      if (ready[i]) return images[i];
      for (let d = 1; d <= REACH; d++) {
        if (i - d >= 0 && ready[i - d]) return images[i - d];
        if (i + d < count && ready[i + d]) return images[i + d];
      }
      // Nothing near: hold the last good frame rather than leaving the canvas
      // on whatever was there. The poster is still underneath at this point.
      return lastImg;
    };

    const paint = (i: number) => {
      const img = nearest(i);
      if (!img) return;
      lastImg = img;
      const cw = cv.width;
      const ch = cv.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    // The denominator the film is scrubbed against. Deliberately NOT
    // `window.innerHeight` read fresh every frame.
    //
    // A phone's URL bar slides away as you scroll down and slides back as you
    // scroll up, and `innerHeight` grows and shrinks by 60 to 130px with it.
    // Dividing by a denominator that moves mid-scroll makes the film jump
    // forward the instant the chrome retracts, which is the lurch you feel a
    // few screens in. So this is measured once and only re-measured on a real
    // resize: a rotation or a width change, or a height change far larger than
    // any browser toolbar.
    //
    // 200px is the calibration knob. Toolbars run to about 130px on the
    // tallest Android chrome; a genuine window resize is almost always more.
    const TOOLBAR_SLACK = 200;
    let lastW = window.innerWidth;
    let stageH = window.innerHeight;

    const resize = () => {
      // The canvas always matches the live viewport, because the stage is
      // `h-dvh` and tracks it too. Sizing the bitmap to a frozen height is
      // what leaves an unpainted band under the film.
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        dirty = true;
      }
      if (window.innerWidth !== lastW || Math.abs(window.innerHeight - stageH) > TOOLBAR_SLACK) {
        lastW = window.innerWidth;
        stageH = window.innerHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    // iOS fires this and not always `resize` when the toolbar collapses.
    window.visualViewport?.addEventListener("resize", resize);

    // ---- overlay, driven by the same progress value ----------------------
    // Written straight to style, not through state: this runs every frame and
    // a setState per frame would be sixty React renders a second to change two
    // properties React does not otherwise own.
    const applyOverlay = (p: number) => {
      capRefs.current.forEach((el, k) => {
        const c = captions[k];
        if (!el || !c) return;
        const [a, b] = c.at;
        // A caption anchored at 0 is already on screen at load, so it skips
        // its fade-in rather than starting invisible.
        const fadeIn = a <= 0 ? 1 : smooth(p, a, a + 0.045);
        const fadeOut = 1 - smooth(p, b - 0.045, b);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - fadeIn) * 24}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      // Scrub velocity, smoothed. Two things ride on it, and both exist to
      // make the stamp read as an object travelling with the film rather than
      // a sticker on the glass: it leans into the direction of travel, and it
      // squashes very slightly as it does.
      const dp = p - lastP;
      lastP = p;
      vel += (dp - vel) * 0.25;
      const lean = Math.max(-1, Math.min(1, vel * 60));

      // Same ramps as the captions, on the same progress value, so a stamp and
      // a caption never drift apart by a frame.
      beatRefs.current.forEach((el, k) => {
        const beat = applyBeats[k];
        if (!el || !beat) return;
        const [a, b] = beat.at;
        const fadeIn = smooth(p, a, a + 0.035);
        const fadeOut = 1 - smooth(p, b - 0.035, b);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        // Overshoot on the way in: past 1 at 0.7 of the ramp, settling back.
        // A stamp that arrives at exactly its final size looks placed; one
        // that overshoots looks thrown.
        const pop = fadeIn < 1 ? 0.86 + fadeIn * 0.19 : 1;
        el.style.transform =
          `translate3d(0, ${(1 - fadeIn) * 26}px, 0) scale(${pop}) rotate(${lean * -2.5}deg)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });

      // The seal is the one element that proves the film is being scrubbed by
      // the visitor rather than played on a clock: its rotation IS the scroll
      // position. Push forward and it turns; drag back and it unwinds.
      sealRefs.current.forEach((el) => {
        if (el) el.style.transform = `rotate(${p * 900}deg)`;
      });

      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (cue.current) cue.current.style.opacity = String(1 - smooth(p, 0, 0.04));
    };

    if (reduced) {
      // No scrubbing at all: load one frame, paint it, show the opening beat.
      const img = new window.Image();
      img.onload = () => {
        images[0] = img;
        ready[0] = true;
        setPrimed(true);
        resize();
        paint(0);
      };
      img.src = url(0);
      applyOverlay(0);
      return () => {
        disposed = true;
        window.removeEventListener("resize", resize);
        window.visualViewport?.removeEventListener("resize", resize);
      };
    }

    // ---- the loop --------------------------------------------------------
    // Progress is read straight off the layout box every frame. No easing, no
    // scrub, no lerp: one scroll position always maps to exactly one frame, so
    // scrolling up is the exact reverse of scrolling down.
    let raf = 0;
    let running = false;
    let lastP = 0;
    let vel = 0;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      const rect = sec.getBoundingClientRect();
      const total = rect.height - stageH;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;

      // The listeners above can miss the one case that matters most: a visitor
      // who flicks in the gap between the HTML arriving and this component
      // mounting, and then holds still. There is no scroll event left to hear,
      // but the film is plainly not at the top, which is the same evidence.
      if (!windowOpen && p > 0.001) open();

      // Snap to a frame that was actually fetched, otherwise `nearest` would
      // be walking outward on every single paint at step 2.
      const k = Math.min(frames - 1, Math.round(p * (frames - 1)));
      const idx = track[k];

      if (idx !== lastDrawn || dirty) {
        lastDrawn = idx;
        dirty = false;
        paint(idx);
        // The window the loader fills travels with the playhead, so moving the
        // playhead is what gives it more to do. Only on a frame change: calling
        // this every rAF would re-scan the window sixty times a second to find
        // the same answer.
        cursor = k;
        pump();
      }
      applyOverlay(p);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
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
    io.observe(sec);

    pump();

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      for (const g of GESTURES) window.removeEventListener(g, open);
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={section} id="tour" style={{ height: TOUR_HEIGHT }} className="relative bg-ink">
      <span id="top" aria-hidden className="absolute top-0" />

      {/* The page's one h1. It lives out here rather than inside a caption
          because captions are toggled to visibility:hidden as the film runs,
          which would pull the heading in and out of the accessibility tree. */}
      <h1 className="sr-only">
        {BRAND.group}, {BRAND.tagline}. JECRC University Jaipur, JECRC University Alwar NCR and JECRC
        Foundation.
      </h1>

      <div className="sticky top-0 h-dvh w-full overflow-hidden bg-ink">
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* The poster, OVER the canvas rather than under it, and faded out
            once there are real frames to show.

            It was underneath, which quietly made it useless. The 2D context is
            requested with `alpha: false` for the draw speed, and an opaque
            canvas is BLACK until something is drawn into it: sitting on top,
            it covered the poster completely, so the first thing anyone saw was
            a black rectangle and the first real picture was the first decoded
            frame. On a throttled phone that measured as 3.7s of LCP render
            delay against 20ms to fetch the poster itself. Over the top, the
            preloaded poster is the first paint, and the canvas cross-fades in
            underneath it once it has something. */}
        <Image
          src={manifest.poster}
          alt=""
          aria-hidden
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${primed ? "opacity-0" : "opacity-100"}`}
        />

        {/* Top and bottom falloff, then a centre scrim so caption type stays
            readable over any frame the film happens to be on. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/80 via-ink/10 to-ink/85" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 48% at 50% 50%, rgba(8,8,10,0.66) 0%, rgba(8,8,10,0.3) 55%, rgba(8,8,10,0) 100%)",
          }}
        />

        <div className="pointer-events-none absolute inset-0">
          {captions.map((c, i) => {
            // A caption anchored at zero is on screen at load, and the crest
            // inside it is the page's largest paint. Rendering it hidden and
            // waiting for the first frame of the overlay loop to reveal it put
            // the whole of hydration in front of the LCP: measured at 3.7s of
            // pure render delay on a throttled phone, against 20ms to fetch
            // the image itself. So the opening beat ships visible, in exactly
            // the state `applyOverlay(0)` would have put it in, and the loop
            // takes over from there without moving anything.
            const open = c.at[0] <= 0;
            return (
            <div
              key={c.title}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden" }}
            >
              {c.variant === "hero" && (
                <Image
                  src={LOGO.lockupMono}
                  alt={`${BRAND.name} and JECRC Medical College Hospital and Research Centre`}
                  width={557}
                  height={258}
                  priority
                  // The published lockup sits on an opaque white plate, so a
                  // CSS invert would give a white rectangle. This is the keyed
                  // version from `npm run brand:mono`.
                  fetchPriority="high"
                  className="mb-8 h-auto w-[min(78vw,25rem)] drop-shadow-[0_2px_30px_rgba(0,0,0,0.55)] md:w-120"
                />
              )}

              {c.eyebrow && (
                <span className="u-eyebrow mb-5 inline-flex items-center gap-3 text-crimson-lit">
                  <span aria-hidden className="h-px w-8 bg-crimson" />
                  {c.eyebrow}
                </span>
              )}

              <p
                aria-hidden={c.variant === "hero"}
                className={
                  c.variant === "hero"
                    ? "u-display text-[13vw] leading-[0.9] text-paper [text-shadow:0_2px_50px_rgba(0,0,0,0.55)] sm:text-[9vw] lg:text-[6vw]"
                    : "u-display max-w-[16ch] text-[10vw] leading-[0.98] text-paper [text-shadow:0_2px_44px_rgba(0,0,0,0.6)] sm:text-[7vw] lg:text-[4.6vw]"
                }
              >
                {c.variant === "hero" ? BRAND.tagline : c.title}
              </p>

              {c.sub && (
                <p className="mt-6 max-w-[46ch] text-[14px] leading-[1.85] text-paper/80 [text-shadow:0_1px_22px_rgba(0,0,0,0.65)] md:text-[15px]">
                  {c.sub}
                </p>
              )}

              {c.variant === "apply" && (
                <div className="pointer-events-auto mt-7 flex w-full max-w-2xl flex-col items-stretch gap-2.5 sm:mt-9 sm:flex-row sm:justify-center sm:gap-3">
                  {APPLY_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 backdrop-blur-md transition-colors duration-300 hover:border-crimson hover:bg-crimson sm:px-6 sm:py-3.5"
                    >
                      <span className="u-eyebrow whitespace-nowrap text-paper">Apply · {link.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-paper/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* ---- the ask, mid-film ----
            One anchor, three moments. An earlier pass alternated sides and
            heights so the stamp would feel alive; what it actually did was
            make the visitor re-find the only button on screen every time it
            came back. Pinned to the bottom gutter it is learned once and then
            simply expected, and the film keeps all the movement.

            Two shells rather than one flat card. The outer is a translucent
            white tray with a hairline; the inner is opaque brand red with a
            lit top edge, on a concentric radius. The tray is what lets it sit
            on a photograph at any exposure without either dissolving into a
            bright frame or turning into a floating slab on a dark one.

            No backdrop blur, deliberately: this sits over a canvas that
            repaints every scrolled frame, so a blur here would be recomputed
            hundreds of times a second on the exact device that can least
            afford it. */}
        {applyBeats.map((beat, i) => {
          const link = APPLY_LINKS[beat.campus % APPLY_LINKS.length];
          const ring = `${uid}-ring-${i}`;
          return (
            <div
              key={`${link.id}-${beat.at[0]}`}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              // Full-width strip on a phone, gutter-aligned card from `sm` up.
              // The width is fixed rather than shrink-to-fit: three campus
              // names of three different lengths would otherwise resize the
              // card on every appearance, which reads as three controls.
              className="pointer-events-auto absolute bottom-[calc(2.25rem+env(safe-area-inset-bottom))] left-[max(var(--pad),env(safe-area-inset-left))] right-[max(var(--pad),env(safe-area-inset-right))] z-10 sm:bottom-16 sm:left-auto sm:w-86"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Apply"
                data-cursor-tone="crimson"
                className="group block rounded-[1.5rem] bg-white/10 p-1 ring-1 ring-white/20 sm:rounded-[1.75rem] sm:p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.16),0_14px_30px_-12px_rgba(0,0,0,0.45),0_40px_80px_-36px_rgba(0,0,0,0.6)] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/16 hover:ring-white/35 active:scale-[0.98]"
              >
                <span className="flex items-center gap-3 rounded-[1.15rem] bg-crimson p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-crimson-deep sm:gap-4 sm:rounded-[1.375rem] sm:p-3 sm:py-3.5">
                  {/* The seal. Its rotation is the scroll position, so it is
                      the one element on screen that answers "am I driving
                      this?" the instant you move. */}
                  <span className="relative grid h-13 w-13 shrink-0 place-items-center sm:h-17 sm:w-17">
                    <svg
                      ref={(el) => {
                        sealRefs.current[i] = el;
                      }}
                      viewBox="0 0 100 100"
                      aria-hidden
                      className="absolute inset-0 h-full w-full"
                    >
                      <defs>
                        <path
                          id={ring}
                          d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                          fill="none"
                        />
                      </defs>
                      {/* Two repetitions, not three: at this radius a third
                          pass overruns the circumference and the words start
                          overprinting each other. */}
                      <text className="fill-paper text-[15px] font-bold uppercase tracking-[0.13em]">
                        <textPath href={`#${ring}`}>Apply now · Apply now ·</textPath>
                      </text>
                    </svg>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-paper" />
                  </span>

                  <span className="min-w-0">
                    <span className="u-eyebrow block text-paper/70">Admissions 2026</span>
                    <span className="u-grotesk mt-0.5 block truncate text-[1.1rem] leading-tight text-paper sm:text-[1.45rem]">
                      {link.label}
                    </span>
                  </span>

                  {/* The arrow gets its own enclosure flush with the inner
                      padding rather than floating beside the text, so the card
                      has an obvious place to aim at and somewhere to move when
                      you reach it. */}
                  <span
                    aria-hidden
                    className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 sm:h-11 sm:w-11 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:bg-paper"
                  >
                    <ArrowUpRight className="h-4 w-4 text-paper transition sm:h-4.5 sm:w-4.5 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-crimson" />
                  </span>
                </span>
              </a>
            </div>
          );
        })}

        {/* Scroll cue, gone the moment the film starts moving. */}
        <div
          ref={cue}
          aria-hidden
          className="pointer-events-none absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-500"
        >
          <span className="u-eyebrow text-white/50">Scroll</span>
          <span className="block h-10 w-px bg-linear-to-b from-white/50 to-transparent" />
        </div>

        {/* Loading readout, only while it matters. */}
        <div
          className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
            primed ? "opacity-0" : "opacity-100"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="u-eyebrow text-white/45">Loading the tour, {pct}%</span>
        </div>

        {/* Playhead. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/12">
          <span ref={bar} className="block h-px origin-left bg-crimson" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
