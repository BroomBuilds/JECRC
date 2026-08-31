"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The pointer.
 *
 * A circle that follows the pointer and only ever changes size. Three states,
 * in order of specificity:
 *
 *   idle         a 30px disc
 *   interactive  a 68px disc, for any link or button
 *   labelled     a 116px filled disc carrying a word
 *
 * Labels are rationed. Two things on the page say anything: the announcement
 * film and the rows in the programmes list. Everything else clickable just
 * makes the circle grow, because a cursor that shouts on every button is
 * noise, and noise is indistinguishable from no signal at all.
 *
 * Elements opt in with `data-cursor="Watch now"`, plus
 * `data-cursor-tone="crimson"` where the fill should be the brand colour.
 *
 * Everything is written straight to `style` inside one rAF loop. Position is
 * lerped toward the real pointer at 0.2 a frame, which is the whole reason it
 * reads as a physical object rather than a div nailed to the mouse. React owns
 * the label and the state class and nothing else, so hovering does not
 * re-render on every pixel.
 *
 * It refuses to mount at all without a fine pointer, and under reduced motion:
 * a lagging cursor is motion whether or not it is decorative, and on a
 * touchscreen there is no pointer to replace. The native cursor is only hidden
 * once this is actually running, so a failure here leaves the normal one.
 */

type State = "idle" | "interactive" | "labelled";

/** What counts as clickable enough to open the circle. */
const INTERACTIVE = 'a[href], button, [role="button"], summary';

/**
 * Sections that paint themselves dark flag it, and the circle flips to white
 * over them. Sampling the pixels underneath would be the clever answer and the
 * wrong one: it costs a readback every frame to learn something the layout
 * already knows.
 */
const INVERT = "[data-cursor-invert]";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [tone, setTone] = useState("ink");
  const [state, setState] = useState<State>("idle");
  const [invert, setInvert] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || still) return;

    const el = dot.current;
    if (!el) return;

    // Only now, once the replacement is definitely running.
    document.documentElement.classList.add("has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    let shown = false;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        // Jump to the first real reading rather than gliding in from the
        // middle of the screen.
        x = tx;
        y = ty;
        shown = true;
        setVisible(true);
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;

      setInvert(!!target.closest(INVERT));

      const labelled = target.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setLabel(labelled.dataset.cursor ?? "");
        setTone(labelled.dataset.cursorTone ?? "ink");
        setState("labelled");
        return;
      }
      setLabel("");
      setState(target.closest(INTERACTIVE) ? "interactive" : "idle");
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    // A drag out of the window fires neither, and the dot would freeze mid-air.
    window.addEventListener("blur", onLeave);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      data-state={state}
      data-tone={tone}
      data-invert={invert || undefined}
      className="u-cursor"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <span className="u-cursor-label">{label}</span>
    </div>
  );
}
