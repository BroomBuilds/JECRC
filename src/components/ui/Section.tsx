import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The eyebrow, and nothing else.
 *
 * There is deliberately no shared `Section` or `SectionHeading` wrapper: every
 * band sets its own `<section>` and heading, because the bands are not the
 * same shape as each other.
 */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("u-eyebrow block text-crimson", className)}>{children}</span>;
}
