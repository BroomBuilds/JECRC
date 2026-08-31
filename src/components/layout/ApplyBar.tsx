"use client";

import { useEffect, useRef, useState } from "react";
import { APPLY_LINKS } from "@/lib/content/universities";
import { useTourComplete } from "@/lib/hooks/useTourComplete";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ChevronDown } from "@/components/ui/Icons";

/**
 * The standing ask.
 *
 * A capsule pinned to the bottom centre rather than a tab on the right edge. A
 * side tab is a thing you learn to ignore because it sits where banner ads sit;
 * the bottom centre is on the path of the thumb on a phone and in the corner of
 * the eye on a desktop, and it can carry a line of copy as well as a button.
 *
 * Paper and red, not black. It is the loudest element on the page by position
 * alone, so it does not also need to be the darkest.
 *
 * `pointer-events-none` on the wrapper is load-bearing, not tidiness. The
 * wrapper is `inset-x-0`, so it spans the full viewport width; without it the
 * strip along the bottom of the screen silently swallowed every click that
 * landed in it, which is what made the FAQ plus buttons look broken.
 *
 * It waits for the film, same as the navbar, and stands down once the footer is
 * on screen, where the same three portals are already laid out full width.
 */
export default function ApplyBar() {
  const revealed = useTourComplete("tour");
  const [open, setOpen] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = revealed && !atFooter;

  return (
    <div
      ref={root}
      id="apply"
      inert={!shown}
      aria-hidden={!shown}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-500 ease-out-expo md:pb-6",
        shown ? "translate-y-0 opacity-100" : "translate-y-[130%] opacity-0"
      )}
    >
      {/* ---- the three portals, above the capsule ---- */}
      <div
        className={cn(
          "pointer-events-auto mb-3 w-full max-w-[26rem] origin-bottom overflow-hidden rounded-2xl border border-rule bg-paper shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] transition duration-400 ease-out-expo",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        )}
      >
        <ul>
          {APPLY_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-4 border-b border-rule px-5 py-4 transition-colors duration-300 last:border-b-0 hover:bg-crimson"
              >
                <span>
                  <span className="u-eyebrow block text-crimson transition-colors duration-300 group-hover:text-white/80">
                    {link.label}
                  </span>
                  <span className="mt-1.5 block text-[14.5px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-paper">
                    {link.name}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-quiet transition-colors duration-300 group-hover:text-paper" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ---- the capsule ----
          Two shells, the same anatomy as the stamp riding along inside the
          film: a paper tray with a hairline, an opaque red pill sitting
          concentric inside it. The phone gets the full width of the tray
          rather than a shrink-to-fit lozenge with its label hidden, which is
          what it was before: a bare "Apply now" pill floating in the middle of
          the screen reads as a stray control, and it wasted the one line of
          copy that says WHY to press it. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="pointer-events-auto flex w-full max-w-[26rem] items-center gap-3 rounded-full border border-rule bg-paper py-2 pl-5 pr-2 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-crimson sm:w-auto sm:gap-4 sm:pl-6"
      >
        <span className="min-w-0 flex-1 text-left sm:flex-none">
          <span className="u-eyebrow block truncate text-crimson sm:hidden">Admissions 2026</span>
          <span className="hidden text-[14px] font-medium text-graphite sm:inline">
            Admissions 2026 are open
          </span>
        </span>
        <span className="u-eyebrow flex shrink-0 items-center gap-2 rounded-full bg-crimson px-5 py-3 text-paper">
          Apply now
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")}
          />
        </span>
      </button>
    </div>
  );
}
