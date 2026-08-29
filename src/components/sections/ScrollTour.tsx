"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import manifest from "@/lib/tour-manifest.json";
import { APPLY_LINKS } from "@/lib/content/universities";
import { BRAND, LOGO } from "@/lib/content/site";
import { ArrowUpRight } from "@/components/ui/Icons";

/** Scroll length of the tour, in vh. Higher is slower and more cinematic. */
export const TOUR_VH = 1500;

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

type Props = { captions?: Caption[] };

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
export default function ScrollTour({ captions = [] }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
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

    // ---- pick the source width ------------------------------------------
    // Capped at 1.75: a 3x phone does not need a 4,000px source for a
    // full-bleed, soft-focus film, and the memory saved matters more than the
    // sharpness lost.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const needed = window.innerWidth * dpr;
    const sizes = [...manifest.sizes].sort((a, b) => a.width - b.width);
    const chosen = sizes.find((s) => s.width >= needed * 0.85) ?? sizes[sizes.length - 1];
    const url = (i: number) => `${base}/${chosen.dir}/f${String(i + 1).padStart(pad, "0")}.${format}`;

    // ---- frame store -----------------------------------------------------
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    const ready: boolean[] = new Array(count).fill(false);
    let loadedCount = 0;
    let current = 0;
    let inflight = 0;

    // Over a real connection every request pays a round trip that localhost
    // does not, so a deep queue hides that latency instead of paying it
    // serially. HTTP/2 multiplexes this onto one connection.
    const CONCURRENCY = 16;

    // Load in passes of decreasing stride, so the whole timeline is covered
    // coarsely almost at once and then fills in. Loading 1..N in order would
    // leave the first seconds pristine while the end is still blank, and a
    // visitor who flicks to the bottom would see nothing.
    const queue: number[] = [];
    const seen = new Set<number>();
    for (const stride of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < count; i += stride) {
        if (!seen.has(i)) {
          seen.add(i);
          queue.push(i);
        }
      }
    }
    if (!seen.has(count - 1)) queue.push(count - 1);

    let disposed = false;
    let dirty = true;

    const pump = () => {
      while (!disposed && inflight < CONCURRENCY && queue.length) {
        // Bias the next pick toward whatever is on screen right now, so a jump
        // into the middle fills the middle first.
        const lookahead = Math.min(queue.length, 48);
        let best = 0;
        for (let k = 1; k < lookahead; k++) {
          if (Math.abs(queue[k] - current) < Math.abs(queue[best] - current)) best = k;
        }
        const i = queue.splice(best, 1)[0];
        inflight++;

        const img = new window.Image();
        img.decoding = "async";

        const settle = () => {
          images[i] = img;
          ready[i] = true;
          loadedCount++;
          inflight--;
          if (loadedCount % 6 === 0 || loadedCount === count) {
            setPct(Math.round((loadedCount / count) * 100));
          }
          // The first coarse pass covers the timeline end to end: enough to
          // show a real picture at any scroll position, so reveal here rather
          // than waiting for all of them.
          if (!disposed && loadedCount >= Math.min(count, Math.ceil(count / 16) + 2)) setPrimed(true);
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

    // ---- drawing ---------------------------------------------------------
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
      const cw = cv.width;
      const ch = cv.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        dirty = true;
      }
    };
    resize();
    window.addEventListener("resize", resize);

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
      };
    }

    // ---- the loop --------------------------------------------------------
    // Progress is read straight off the layout box every frame. No easing, no
    // scrub, no lerp: one scroll position always maps to exactly one frame, so
    // scrolling up is the exact reverse of scrolling down.
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
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={section} id="tour" style={{ height: `${TOUR_VH}vh` }} className="relative">
      <span id="top" aria-hidden className="absolute top-0" />

      {/* The page's one h1. It lives out here rather than inside a caption
          because captions are toggled to visibility:hidden as the film runs,
          which would pull the heading in and out of the accessibility tree. */}
      <h1 className="sr-only">
        {BRAND.group}, {BRAND.tagline}. JECRC University Jaipur, JECRC University Alwar NCR and JECRC
        Foundation.
      </h1>

      <div className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {/* Poster underlay, so there is never a blank frame. */}
        <Image
          src={manifest.poster}
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${primed ? "opacity-0" : "opacity-100"}`}
        />

        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

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
          {captions.map((c, i) => (
            <div
              key={c.title}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ opacity: 0, visibility: "hidden" }}
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
                    ? "u-serif text-[13vw] leading-[0.9] text-paper [text-shadow:0_2px_50px_rgba(0,0,0,0.55)] sm:text-[9vw] lg:text-[6vw]"
                    : "u-serif max-w-[16ch] text-[10vw] leading-[0.98] text-paper [text-shadow:0_2px_44px_rgba(0,0,0,0.6)] sm:text-[7vw] lg:text-[4.6vw]"
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
                <div className="pointer-events-auto mt-9 flex w-full max-w-2xl flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
                  {APPLY_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 backdrop-blur-md transition-colors duration-300 hover:border-crimson hover:bg-crimson"
                    >
                      <span className="u-eyebrow whitespace-nowrap text-paper">Apply · {link.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-paper/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

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
