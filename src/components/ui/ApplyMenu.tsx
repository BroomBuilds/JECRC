"use client";

import { useEffect, useId, useRef, useState } from "react";
import { APPLY_LINKS } from "@/lib/content/universities";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ChevronDown } from "./Icons";

type Tone = "chrome" | "solid" | "ghost";

const TRIGGER: Record<Tone, string> = {
  // The outlined pill from the live navbar.
  chrome: "border-crimson text-crimson hover:bg-crimson hover:text-paper",
  solid: "border-crimson bg-crimson text-paper hover:bg-crimson-deep",
  ghost: "border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper",
};

/**
 * Apply Now.
 *
 * The live site has one apply button because it fronts one campus. This page
 * fronts three, each with its own application portal, so the single button
 * opens onto the three destinations rather than guessing which one the visitor
 * means or, worse, sending everyone to Jaipur.
 */
export default function ApplyMenu({
  tone = "chrome",
  label = "Apply Now",
  className,
  align = "right",
}: {
  tone?: Tone;
  label?: string;
  className?: string;
  align?: "left" | "right" | "center";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        className={cn("u-pill whitespace-nowrap px-5 py-2.5 md:px-6", TRIGGER[tone])}
      >
        {label}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label="Choose a campus to apply to"
        className={cn(
          "absolute top-[calc(100%+0.6rem)] z-10 w-[min(88vw,21rem)] origin-top overflow-hidden rounded-lg border border-rule bg-paper shadow-[0_24px_60px_-24px_rgba(0,0,0,0.28)] transition duration-300 ease-out-expo",
          align === "right" && "right-0",
          align === "left" && "left-0",
          align === "center" && "left-1/2 -translate-x-1/2",
          open ? "visible scale-100 opacity-100" : "invisible scale-[0.97] opacity-0"
        )}
      >
        {APPLY_LINKS.map((link) => (
          <a
            key={link.id}
            role="menuitem"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="group flex items-center justify-between gap-4 border-b border-rule px-5 py-4 text-left transition-colors duration-300 last:border-b-0 hover:bg-bone"
          >
            <span>
              <span className="u-eyebrow block text-crimson">{link.label}</span>
              <span className="mt-1.5 block text-[14px] font-medium leading-snug text-ink">
                {link.name}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-quiet transition-colors duration-300 group-hover:text-ink" />
          </a>
        ))}
      </div>
    </div>
  );
}
