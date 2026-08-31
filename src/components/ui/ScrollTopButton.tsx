"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The logo, as a button rather than a link.
 *
 * It has to put the page back at the very top and leave the address bar alone.
 * An `href="#top"` cannot do that: the smooth-scroll handler writes the hash
 * into history on every anchor jump, so clicking the crest left `#top` stuck on
 * the URL, and a hash is a poor thing to hand someone who just wanted to go
 * back to the start.
 *
 * The scroll itself is delegated: SmoothScroll owns the Lenis instance and
 * picks this up through `data-scroll-top`, so there is no second scroller here
 * fighting the first. The onClick below is the fallback for when Lenis is not
 * running, which is the case under reduced motion.
 */
export default function ScrollTopButton({
  children,
  className,
  style,
  label = "JECRC, back to the top",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <button
      type="button"
      data-scroll-top
      aria-label={label}
      onClick={(e) => {
        // SmoothScroll calls preventDefault when it has handled this, so this
        // only runs when nothing else did.
        if (e.defaultPrevented) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
