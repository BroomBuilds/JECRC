"use client";

import { useEffect } from "react";

/** Rect-based reveal — never misses an element on a fast scroll or a jump. */
export default function Reveal() {
  useEffect(() => {
    let els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!els.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    let ticking = false;
    const check = () => {
      ticking = false;
      const line = window.innerHeight * 0.9;
      let dirty = false;
      for (const el of els) {
        if (el.classList.contains("is-in")) continue;
        const r = el.getBoundingClientRect();
        if (r.top < line && r.bottom > -window.innerHeight) { el.classList.add("is-in"); dirty = true; }
      }
      if (dirty) els = els.filter((el) => !el.classList.contains("is-in"));
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const t = setInterval(onScroll, 400);
    return () => {
      clearInterval(t);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
