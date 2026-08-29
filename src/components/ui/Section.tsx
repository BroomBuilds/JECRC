import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The page's vertical rhythm, in one place.
 *
 * Every band is the same shape: an id to anchor to, a tone that decides the
 * ground colour, and consistent padding that steps up with the viewport. Doing
 * this per section is how spacing drifts.
 */

const TONE = {
  ink: "bg-ink",
  void: "bg-void",
  surface: "bg-surface",
} as const;

export function Section({
  id,
  tone = "ink",
  className,
  children,
  bleed = false,
}: {
  id?: string;
  tone?: keyof typeof TONE;
  className?: string;
  children: ReactNode;
  /** Skip the shell so the section can run full-bleed. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      // Anchors land under a 100px fixed navbar without this.
      style={id ? { scrollMarginTop: "6.5rem" } : undefined}
      className={cn("relative py-24 md:py-32 lg:py-40", TONE[tone], className)}
    >
      {bleed ? children : <div className="u-shell">{children}</div>}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("u-label inline-flex items-center gap-3 text-crimson", className)}>
      <span aria-hidden className="h-px w-8 bg-crimson" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      {eyebrow && (
        <div data-reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <Tag
        data-reveal
        style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
        className="u-display mt-6 max-w-[19ch] pb-[0.1em] text-[2.5rem] text-paper sm:text-[3.25rem] lg:text-[4rem]"
      >
        {title}
      </Tag>
      {lead && (
        <p
          data-reveal
          style={{ "--reveal-delay": "160ms" } as React.CSSProperties}
          className={cn(
            "mt-8 max-w-[56ch] text-[15px] leading-[1.85] text-mist md:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
