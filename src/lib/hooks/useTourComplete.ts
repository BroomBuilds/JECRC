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

    /**
     * How far back past the line the tour has to come before this un-arrives.
     *
     * Asymmetric on purpose. `window.innerHeight` is not a constant on a
     * phone: the browser's own toolbars retract on the way down and come back
     * on the way up, and 60 to 130px of viewport arrives and leaves with them.
     * A single threshold turns that into a scroll-direction flicker — a
     * visitor who reaches the end of the film and then scrolls up a little
     * makes the toolbar reappear, `innerHeight` drops by a toolbar, the test
     * goes false again, and the navbar and the apply bar both retreat off
     * screen while they are still reading.
     *
     * So arriving is exact, to keep the navbar landing on the beat the film
     * ends on, and leaving needs a full toolbar's worth more than that. The
     * only way back to false is genuinely scrolling the tour back into view.
     */
    const ARRIVE = 4;   // sub-pixel slack; the bottom edge rarely lands exactly
    const LEAVE = 180;  // more than any mobile toolbar is tall

    const read = () => {
      frame = 0;
      const bottom = el.getBoundingClientRect().bottom;
      const next = last
        ? bottom <= window.innerHeight + LEAVE
        : bottom <= window.innerHeight + ARRIVE;
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
