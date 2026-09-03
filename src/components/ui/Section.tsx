import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The eyebrow, and nothing else.
 *
 * This file used to carry a `Section` wrapper and a `SectionHeading` block as
 * well — a section shape with a tone token and stepped padding, and a standard
 * opener of eyebrow, headline and lead. Neither was ever adopted: every band on
 * the page sets its own `<section>` and its own heading, because the bands are
 * not the same shape as each other and forcing them into one was the thing that
 * made them worse. `SectionHeading` was also still documenting a serif display
 * face against a sans lead, which is a type pairing this site does not use and
 * has not used for some time.
 *
 * An abstraction nobody reaches for is not a spare part, it is a second answer
 * to a question the codebase already answered. Both are gone.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("u-eyebrow block text-crimson", className)}>{children}</span>;
}
