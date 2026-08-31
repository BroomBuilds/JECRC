"use client";

import { useEffect } from "react";

/**
 * Drives every `[data-reveal]` on the page from one rAF-throttled scroll
 * handler.
 *
 * Rect-based rather than an IntersectionObserver on purpose. An observer that
 * misses its callback during a fast flick, a hash jump or a bfcache restore
 * leaves an element stranded at opacity 0, and the failure is invisible in
 * development because nothing scrolls that fast by hand. Re-reading the box is
 * cheap when the element list shrinks as elements land.
 */
export default function Reveal() {
  useEffect(() => {
    let pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!pending.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pending.forEach((el) => el.classList.add("is-in"));
      return;
    }

    let frame = 0;

    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.88;
      let landed = false;

      for (const el of pending) {
        const rect = el.getBoundingClientRect();
        if (rect.top < line && rect.bottom > -window.innerHeight) {
          el.classList.add("is-in");
          landed = true;
        }
      }
      if (landed) pending = pending.filter((el) => !el.classList.contains("is-in"));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Catches content that changes height after load (fonts, images) without
    // wiring an observer per element.
    const sweep = window.setInterval(schedule, 500);

    return () => {
      window.clearInterval(sweep);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return null;
}
