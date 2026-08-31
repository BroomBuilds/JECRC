import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The page's vertical rhythm, in one place.
 *
 * Every band is the same shape: an id to anchor to, a tone that picks the
 * ground, and padding that steps up with the viewport. Setting this per section
 * is how spacing drifts.
 */

const TONE = {
  paper: "bg-paper text-ink",
  bone: "bg-bone text-ink",
  obsidian: "bg-obsidian text-paper",
} as const;

export function Section({
  id,
  tone = "paper",
  className,
  children,
  bleed = false,
}: {
  id?: string;
  tone?: keyof typeof TONE;
  className?: string;
  children: ReactNode;
  /** Skip the shell so the section can run full bleed. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      // Anchors land under a 100px fixed navbar without this.
      style={id ? { scrollMarginTop: "6.5rem" } : undefined}
      className={cn("relative py-20 md:py-28 lg:py-36", TONE[tone], className)}
    >
      {bleed ? children : <div className="u-shell">{children}</div>}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("u-eyebrow block text-crimson", className)}>{children}</span>;
}

/**
 * The standard block opener: eyebrow, serif headline, sans lead.
 *
 * The headline is the serif and the lead is the grotesque, never the reverse.
 * Keeping the two voices in fixed roles is most of what makes a type pairing
 * read as deliberate.
 */
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
        style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
        className="u-display mt-5 max-w-[17ch] pb-[0.12em] text-[2rem] text-ink sm:mt-6 sm:text-[2.9rem] lg:text-[clamp(3.25rem,4.4vw,4.75rem)]"
      >
        {title}
      </Tag>
      {lead && (
        <p
          data-reveal
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          className={cn(
            "mt-6 max-w-[52ch] text-[15.5px] leading-[1.7] text-graphite md:mt-8 md:text-[17px]",
            align === "center" && "mx-auto"
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
