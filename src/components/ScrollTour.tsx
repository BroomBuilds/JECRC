"use client";

import { useEffect, useRef, useState } from "react";
import manifest from "@/lib/tour-manifest.json";
import Crest from "./Crest";

/** Total scroll height of the tour, in vh. More = slower, more cinematic. */
export const TOUR_VH = 1500;

export type Caption = {
  /** [fade-in point, fade-out point] as fractions of the tour, 0–1 */
  at: [number, number];
  eyebrow?: string;
  title: string;
  sub?: string;
  /** "hero" adds the crest and the rule-and-tagline lockup */
  variant?: "hero";
  tagline?: string;
};

type Props = { captions?: Caption[]; className?: string };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smooth = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * Scroll-driven tour, rendered as an image sequence on a canvas.
 *
 * Why not a <video> scrubbed with currentTime? Because seeking a compressed
 * video is asymmetric: forward is one frame of decode, backward means jumping
 * to the previous keyframe and decoding forward to the target. That is exactly
 * why video scrubbing feels fine going down and awful coming back up. A decoded
 * image sequence has no keyframes and no decoder state, so frame N costs the
 * same whichever direction you arrived from.
 *
 * Frames are produced by `npm run tour:build <video>`.
 */
export default function ScrollTour({ captions = [], className = "" }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
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

    // ---- pick the source width -------------------------------------------
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const needed = window.innerWidth * dpr;
    const sizes = [...manifest.sizes].sort((a, b) => a.width - b.width);
    const chosen = sizes.find((s) => s.width >= needed * 0.85) ?? sizes[sizes.length - 1];
    const url = (i: number) =>
      `${base}/${chosen.dir}/f${String(i + 1).padStart(pad, "0")}.${format}`;

    // ---- frame store ------------------------------------------------------
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    const ready: boolean[] = new Array(count).fill(false);
    let loadedCount = 0;
    let current = 0;
    let inflight = 0;
    // Higher than the local-network-tuned 8: over a real connection every
    // request pays RTT that localhost doesn't, so more in-flight requests
    // hides that latency instead of eating it serially. HTTP/2 (any real
    // host/CDN) multiplexes this fine on one connection.
    const CONCURRENCY = 16;

    // Load in passes of decreasing stride, so the whole timeline is covered
    // coarsely almost immediately and then fills in — rather than the first
    // three seconds being perfect while the end is still blank.
    const queue: number[] = [];
    const seen = new Set<number>();
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) {
        if (!seen.has(i)) { seen.add(i); queue.push(i); }
      }
    }
    if (!seen.has(count - 1)) queue.push(count - 1);

    let disposed = false;

    const pump = () => {
      while (!disposed && inflight < CONCURRENCY && queue.length) {
        // Bias the next pick toward whatever is on screen right now.
        const window_ = Math.min(queue.length, 48);
        let best = 0;
        for (let k = 1; k < window_; k++) {
          if (Math.abs(queue[k] - current) < Math.abs(queue[best] - current)) best = k;
        }
        const i = queue.splice(best, 1)[0];
        inflight++;
        const img = new Image();
        img.decoding = "async";
        const settle = () => {
          images[i] = img;
          ready[i] = true;
          loadedCount++;
          inflight--;
          if (loadedCount % 6 === 0 || loadedCount === count) {
            setPct(Math.round((loadedCount / count) * 100));
          }
          // enough of the timeline covered to show something everywhere → reveal
          if (!disposed && loadedCount >= Math.min(count, Math.ceil(count / 16) + 2)) setPrimed(true);
          dirty = true;
          pump();
        };
        img.onload = () => {
          // Decode up front, off the paint path. Without this the first
          // drawImage of each frame decodes synchronously inside rAF, which is
          // the one thing that can still drop a frame mid-scroll.
          if (typeof img.decode === "function") img.decode().then(settle, settle);
          else settle();
        };
        img.onerror = () => { inflight--; pump(); };
        img.src = url(i);
      }
    };

    // ---- drawing ----------------------------------------------------------
    let dirty = true;
    let lastDrawn = -1;

    const nearest = (i: number) => {
      if (ready[i]) return images[i];
      for (let d = 1; d < count; d++) {
        if (i - d >= 0 && ready[i - d]) return images[i - d];
        if (i + d < count && ready[i + d]) return images[i + d];
      }
      return undefined;
    };

    const paint = (i: number) => {
      const img = nearest(i);
      if (!img) return;
      const cw = cv.width, ch = cv.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w; cv.height = h;
        dirty = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // ---- caption + chrome driven by the same progress value ---------------
    const applyOverlay = (p: number) => {
      capRefs.current.forEach((el, k) => {
        const c = captions[k];
        if (!el || !c) return;
        const [a, b] = c.at;
        // A caption anchored at 0 is already on screen when the page loads.
        const fadeIn = a <= 0 ? 1 : smooth(p, a, a + 0.045);
        const fadeOut = 1 - smooth(p, b - 0.045, b);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - fadeIn) * 26}px)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };

    if (reduced) {
      // No scrubbing: load a single frame and show the opening caption.
      const img = new Image();
      img.onload = () => { images[0] = img; ready[0] = true; setPrimed(true); resize(); paint(0); };
      img.src = url(0);
      applyOverlay(0);
      return () => { disposed = true; window.removeEventListener("resize", resize); };
    }

    // ---- the loop ---------------------------------------------------------
    // Progress is read straight off the layout box every frame. No easing, no
    // scrub, no lerp: one scroll position always maps to exactly one frame, so
    // scrolling up is bit-for-bit the reverse of scrolling down. Lenis already
    // smooths the scroll position itself; smoothing it twice is what makes
    // these things feel like they are swimming.
    let raf = 0;
    let running = false;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      const rect = sec.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;

      const idx = Math.round(p * (count - 1));
      current = idx;

      if (idx !== lastDrawn || dirty) {
        lastDrawn = idx;
        dirty = false;
        paint(idx);
      }
      applyOverlay(p);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); }
        else if (!entry.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
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
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={section} id="top" className={`relative ${className}`} style={{ height: `${TOUR_VH}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {/* poster underlay — never a blank frame */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={manifest.poster}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${primed ? "opacity-0" : "opacity-100"}`}
        />
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/15 to-ink/80" />
        {/* centre scrim so caption type stays readable over any frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(58% 46% at 50% 50%, rgba(13,10,10,0.62) 0%, rgba(13,10,10,0.28) 55%, rgba(13,10,10,0) 100%)" }}
        />

        <div ref={overlay} className="pointer-events-none absolute inset-0">
          {captions.map((c, i) => (
            <div
              key={c.title}
              ref={(el) => { capRefs.current[i] = el; }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {c.variant === "hero" && <Crest className="mb-7 h-24 w-24 text-paper md:h-32 md:w-32" />}
              {c.eyebrow && (
                <span className="label mb-5 inline-flex items-center gap-3 text-crimson-pale">
                  <span className="h-px w-8 bg-crimson" />
                  {c.eyebrow}
                </span>
              )}
              <h2
                className={
                  c.variant === "hero"
                    ? "display text-[12vw] leading-[0.95] text-paper [text-shadow:0_2px_40px_rgba(0,0,0,0.5)] sm:text-[8vw] lg:text-[5.6vw]"
                    : "display max-w-[17ch] text-[10vw] leading-[0.98] text-paper [text-shadow:0_2px_40px_rgba(0,0,0,0.55)] sm:text-[6.5vw] lg:text-[4.4vw]"
                }
              >
                {c.title}
              </h2>
              {c.variant === "hero" && c.tagline && (
                <span className="mt-6 flex items-center gap-5">
                  <span className="h-px w-10 bg-crimson/70 md:w-16" />
                  <span className="label text-crimson-pale">{c.tagline}</span>
                  <span className="h-px w-10 bg-crimson/70 md:w-16" />
                </span>
              )}
              {c.sub && (
                <p className="mt-6 max-w-[46ch] text-[14px] leading-[1.9] font-light text-paper/75 [text-shadow:0_1px_20px_rgba(0,0,0,0.6)] md:text-base">
                  {c.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* loading readout, only while it matters */}
        <div
          className={`pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
            pct >= 100 || primed ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="label text-white/45">Loading the tour · {pct}%</span>
        </div>

        {/* playhead */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/12">
          <span ref={bar} className="block h-px origin-left bg-crimson" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
