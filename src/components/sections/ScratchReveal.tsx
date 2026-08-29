"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { APPLY_LINKS } from "@/lib/content/universities";
import { ArrowRight } from "@/components/ui/Icons";

/**
 * The scratch band.
 *
 * A rebuild of the reveal on the arts.vcu.edu hero, measured off the live page
 * by instrumenting its canvas rather than guessing at it.
 *
 * How it works. A collage sits at the bottom of the stack. Over it lies a
 * canvas whose CSS background is white and whose blend mode is `screen`. Screen
 * against white is white, so the band reads as blank paper. Paint BLACK into
 * the canvas and screen against black is the backdrop, so wherever the brush
 * has been, the collage shows through. No masks, no clip paths, no second copy
 * of the images.
 *
 * The brush is the part worth copying exactly. It is not one circle: it is a
 * core disc of roughly 52px with a dozen small satellites strung out
 * VERTICALLY around it, radii five to thirteen. The source's own draw calls
 * gave every satellite the same x as the core, which is why the revealed shapes
 * have ragged top and bottom edges and clean horizontal sweeps. All the radii
 * breathe on one slow phase, so a stationary cursor keeps opening the hole
 * instead of freezing.
 *
 * Everything else follows from that: interpolate between pointer samples so a
 * fast flick does not leave gaps, wash the whole canvas with a very low alpha
 * white each frame so the trail closes over about four seconds, and run a
 * wandering path when nobody has touched the band yet, since a reveal nobody
 * discovers is not a feature.
 */

/** Alpha of the white wash painted over the canvas each frame. */
const HEAL = 0.014;
/** Core brush radius, before the breathing modulation. */
const CORE = 52;
const SATELLITES = 12;
/** How far up and down the satellites string out from the core. */
const SPREAD = 68;

type Sat = { offset: number; radius: number; phase: number };

const makeSatellites = (): Sat[] =>
  Array.from({ length: SATELLITES }, (_, i) => {
    // Deterministic rather than random: the brush should look the same on
    // every load, and a seeded shape is easier to tune than a lucky one.
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
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const sec = section.current;
    const cv = canvas.current;
    if (!sec || !cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sats = makeSatellites();

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const r = sec.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = r.width;
      height = r.height;
      cv.width = Math.round(width * dpr);
      cv.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(sec);

    /** Paint one brush stamp, centred on the given point. */
    const stamp = (x: number, y: number, phase: number) => {
      const breathe = 1 + Math.sin(phase) * 0.09;
      ctx.fillStyle = "#000";

      ctx.beginPath();
      ctx.arc(x, y, CORE * breathe, 0, Math.PI * 2);
      ctx.fill();

      for (const s of sats) {
        ctx.beginPath();
        ctx.arc(x, y + s.offset, s.radius * (1 + Math.sin(phase + s.phase) * 0.22), 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Pointer state. `have` stays false until something actually moves over the
    // band, which is what keeps the idle path running underneath.
    let px = 0;
    let py = 0;
    let lastX = 0;
    let lastY = 0;
    let have = false;
    let idle = 0;

    const onPointer = (e: PointerEvent) => {
      const r = sec.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!have) {
        lastX = px;
        lastY = py;
        have = true;
      }
      idle = 0;
    };
    sec.addEventListener("pointermove", onPointer, { passive: true });
    sec.addEventListener("pointerdown", onPointer, { passive: true });
    sec.addEventListener("pointerleave", () => { have = false; }, { passive: true });

    if (reduced) {
      // No loop and no trail: open a wide band across the middle once, so the
      // collage is visible and the section still reads as designed.
      const draw = () => {
        resize();
        for (let x = -80; x < width + 80; x += 26) stamp(x, height * 0.52, 0);
      };
      draw();
      const onResize = () => draw();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        sec.removeEventListener("pointermove", onPointer);
        sec.removeEventListener("pointerdown", onPointer);
      };
    }

    let raf = 0;
    let running = false;
    let t = 0;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      t += 0.06;

      // Heal: a whisper of white over everything, so old trail closes up.
      ctx.fillStyle = `rgba(255,255,255,${HEAL})`;
      ctx.fillRect(0, 0, width, height);

      let x = px;
      let y = py;

      if (!have || idle > 90) {
        // Nobody is driving. Wander a wide, slow figure across the band so the
        // effect announces itself.
        idle++;
        const a = t * 0.16;
        x = width * (0.5 + 0.42 * Math.sin(a));
        y = height * (0.5 + 0.3 * Math.sin(a * 1.7 + 0.9));
        if (!have) {
          lastX = lastX || x;
          lastY = lastY || y;
        }
      } else {
        idle++;
      }

      // Interpolate from the previous point, so a fast flick draws a stroke
      // rather than a dotted line.
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.min(24, Math.max(1, Math.round(dist / 14)));
      for (let i = 1; i <= steps; i++) {
        stamp(lastX + (dx * i) / steps, lastY + (dy * i) / steps, t + i * 0.2);
      }
      lastX = x;
      lastY = y;
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

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      sec.removeEventListener("pointermove", onPointer);
      sec.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  return (
    <section
      ref={section}
      id="build"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative isolate overflow-hidden bg-paper"
    >
      {/* ---- the collage, bottom of the stack ---- */}
      <div aria-hidden className="absolute inset-0 grid grid-cols-3 md:grid-cols-5">
        {images.map((src, i) => (
          <div key={src + i} className="relative">
            <Image
              src={src}
              alt=""
              fill
              sizes="(min-width: 768px) 20vw, 34vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* ---- the paper, and the brush that takes it away ----
          Screen against the white background is white, so this reads as blank
          until something paints black into it. */}
      <canvas
        ref={canvas}
        aria-hidden
        className="absolute inset-0 h-full w-full bg-paper"
        style={{ mixBlendMode: "screen" }}
      />

      {/* ---- content ---- */}
      <div className="relative z-10 u-shell py-24 md:py-32 lg:py-40">
        <p // Tight leading with explicit padding rather than a looser line box:
          // the wordmark should sit as low as the grotesque allows, but the
          // descender on the j overflows a sub-1 line box and lands on the
          // statement underneath.
          className="u-grotesk-black select-none pb-[0.16em] text-[22vw] leading-[0.85] text-ink lg:text-[15.5vw]">
          jecrc
        </p>

        <p className="u-serif mt-6 max-w-[22ch] text-[9vw] leading-[1.08] text-ink sm:text-[6.5vw] lg:max-w-[24ch] lg:text-[clamp(2.5rem,3.8vw,3.75rem)]">
          {/* A white inline background, the same trick the source uses. It is
              invisible on the paper and becomes a highlight exactly where the
              brush has opened the collage underneath, which is what keeps the
              statement readable over a photograph without dimming the reveal.
              box-decoration-clone so every wrapped line gets its own box. */}
          <span className="box-decoration-clone bg-paper px-1 -mx-1">
            Twenty-six years of building people who build things. Find the campus, the school and
            the year that fits.
          </span>
        </p>

        <div className="mt-12 flex flex-wrap gap-3">
          {APPLY_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-pill bg-paper text-ink hover:bg-ink hover:text-paper"
            >
              Apply · {link.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
