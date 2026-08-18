"use client";

import { useEffect, type RefObject } from "react";

/**
 * Calls back with 0→1 as a section travels from "top hits top of viewport" to
 * "bottom hits bottom of viewport". Read straight off the layout box in a rAF
 * loop that only runs while the section is on screen.
 *
 * Deliberately un-eased: Lenis already smooths the scroll position, and easing
 * a smoothed value again is what makes scroll-linked animation feel laggy on
 * the way back up.
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  opts: { mode?: "pin" | "through" } = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mode = opts.mode ?? "pin";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { onProgress(mode === "through" ? 0.5 : 0); return; }

    let raf = 0;
    let running = false;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "through") {
        // 0 when the section's top enters from below, 1 when its bottom exits the top
        p = (vh - r.top) / (vh + r.height);
      } else {
        const total = r.height - vh;
        p = total > 0 ? -r.top / total : 0;
      }
      onProgress(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); }
        else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
      },
      { rootMargin: "160px 0px" }
    );
    io.observe(el);

    return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
