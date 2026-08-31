"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, PlayMark } from "./Icons";

/**
 * A video that opens where you are.
 *
 * Built on the native `<dialog>` element rather than a div with a z-index. That
 * one choice buys the focus trap, Escape to close, the inert background, the
 * top-layer stacking that ignores every ancestor's overflow and transform, and
 * focus returning to the trigger on close. All of it is behaviour a hand-rolled
 * modal has to reimplement and usually gets three quarters right.
 *
 * The iframe is mounted only while the dialog is open. Rendering it up front
 * would pull YouTube's player onto every first paint of the page for a video
 * most visitors never ask for, and unmounting on close is also what stops the
 * audio: there is no other way to halt playback without the YouTube API.
 *
 * The embed is `youtube-nocookie.com`, which is the same player without the
 * tracking cookie until the visitor actually presses play.
 */
export default function VideoDialog({
  videoId,
  label,
  title,
  href,
  eyebrow,
}: {
  videoId: string;
  /** Trigger text. */
  label: string;
  /** Announced as the dialog's name, and used as the iframe title. */
  title: string;
  /** Where to send anyone who would rather watch it on YouTube. */
  href: string;
  eyebrow?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el || !open) return;

    el.showModal();
    // `<dialog>` blocks interaction with the page behind it but does not stop
    // it scrolling, and a page scrolling under a fixed video is disorienting.
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previous;
      if (el.open) el.close();
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="Watch now"
        data-cursor-tone="crimson"
        className="group inline-flex items-center gap-4 text-left"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-crimson text-crimson transition-colors duration-400 group-hover:bg-crimson group-hover:text-paper">
          <PlayMark className="ml-0.5 h-4 w-4" />
        </span>
        <span className="text-[15px] font-bold tracking-[-0.015em] text-ink">{label}</span>
      </button>

      <dialog
        ref={dialog}
        aria-label={title}
        // Escape and the close button both land here, so this is the single
        // place that has to unmount the iframe.
        onClose={() => setOpen(false)}
        // A click that lands on the dialog itself is a click outside the panel.
        // The dialog is sized to the whole viewport rather than to the panel
        // precisely so that this is unambiguous: sized to the panel, the area
        // around it belongs to ::backdrop, whose hit testing is not something
        // to rely on.
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        // `hidden open:grid`, not `grid`. The browser hides a closed dialog
        // with `dialog:not([open]) { display: none }` from its own stylesheet,
        // and an unconditional `display: grid` from a utility class outranks
        // it: the dialog closed, the iframe unmounted, and the dim stayed on
        // screen until something else forced a repaint.
        className="hidden h-dvh max-h-none w-screen max-w-none place-items-center overflow-hidden border-0 bg-ink/85 p-0 backdrop-blur-sm backdrop:bg-transparent open:grid"
      >
        {open && (
          // Width is capped by the viewport height as well as its width, so a
          // 16:9 panel plus its chrome always fits without the dialog scrolling.
          <div className="w-[min(94vw,68rem,calc((92dvh-7.5rem)*16/9))] overflow-hidden rounded-2xl border border-crimson/40 bg-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            {/* ---- brand bar ---- */}
            <div className="flex items-center justify-between gap-4 bg-crimson px-5 py-3.5 md:px-6">
              <p className="min-w-0">
                {eyebrow && <span className="u-eyebrow block text-white/75">{eyebrow}</span>}
                <span className="mt-0.5 block truncate text-[15px] font-bold tracking-[-0.015em] text-paper md:text-[16px]">
                  {title}
                </span>
              </p>

              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close the video"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/40 text-paper transition-colors duration-300 hover:bg-paper hover:text-crimson"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden className="h-4 w-4">
                  <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* ---- the film ---- */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            <div className="flex items-center justify-end bg-ink px-5 py-3 md:px-6">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="u-underline inline-flex items-center gap-2 text-[13px] font-medium text-paper/70 transition-colors duration-300 hover:text-paper"
              >
                Watch on YouTube
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
