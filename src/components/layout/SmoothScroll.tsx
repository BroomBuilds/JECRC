"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Height of the fixed navbar, so anchored sections do not land under it. */
const NAV_OFFSET = 104;

/**
 * Lenis, and nothing stacked on top of it.
 *
 * The scroll tour reads window scroll position directly, every frame. Lenis
 * smooths that position once. Anything that eases on top of it, a ScrollTrigger
 * scrub or a lerp toward a target, is smoothing an already-smoothed value, and
 * the delay that introduces is exactly what reads as lag when you reverse
 * direction. So: one filter, no more.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      // The crest goes back to the very top and writes nothing to the address
      // bar. It cannot be an anchor: the branch below puts the hash into
      // history, and `#top` is a poor thing to leave on the URL of someone who
      // only wanted to start again.
      const toTop = (event.target as HTMLElement)?.closest?.("[data-scroll-top]");
      if (toTop) {
        event.preventDefault();
        lenis.scrollTo(0, { duration: 1.2 });
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash.length < 2) return;
      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      // #top is the tour: land on its first frame, not below the navbar.
      const offset = hash === "#top" ? 0 : -NAV_OFFSET;
      lenis.scrollTo(target as HTMLElement, { offset, duration: 1.4 });
      history.replaceState(null, "", hash);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
