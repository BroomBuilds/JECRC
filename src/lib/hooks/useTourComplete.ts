"use client";

import { useEffect, useState } from "react";

/**
 * True once the scroll tour has played all the way out.
 *
 * The tour is a tall section with a sticky, viewport-height stage inside it, so
 * its progress reaches 1 at exactly the moment its bottom edge reaches the
 * bottom of the viewport. Watching for that is the same event the tour uses to
 * draw its last frame, which is why the navbar arrives on the beat rather than
 * at some scroll distance that happens to look about right.
 *
 * Resolves to true immediately when there is no tour on the page, so a route
 * without one is never left without navigation, and when reduced motion is
 * requested, because there is no film to wait for.
 *
 * Every state write happens inside a rAF callback rather than in the effect
 * body: a synchronous setState here would cascade an extra render on mount for
 * a value that is false on all but a handful of loads.
 */
export function useTourComplete(targetId: string) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetId);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;

    if (!el || reduced) {
      frame = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(frame);
    }

    let last = false;

    const read = () => {
      frame = 0;
      // 4px of slack: sub-pixel layout means the bottom edge rarely lands
      // exactly on the viewport height.
      const next = el.getBoundingClientRect().bottom <= window.innerHeight + 4;
      if (next !== last) {
        last = next;
        setDone(next);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [targetId]);

  return done;
}
