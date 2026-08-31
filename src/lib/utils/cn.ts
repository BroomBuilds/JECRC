/**
 * Join class names, dropping anything falsy.
 *
 * Deliberately not clsx + tailwind-merge: nothing here builds conflicting
 * utility strings at runtime, so a dependency would buy nothing.
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
