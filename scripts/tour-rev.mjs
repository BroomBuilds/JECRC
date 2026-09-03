import { createHash } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fingerprint of a built tour, used as the `?v=` on every frame URL.
 *
 * The frames sit behind `immutable, max-age=1y` but their paths never change
 * — /media/tour/640/f0001.webp is the same URL for every film ever built — so
 * without this a phone that saw one cut keeps it for a year and no deploy can
 * reach it. The query is what makes the immutable claim true.
 *
 * Byte sizes only, no reads: a stat per frame, and identical output gives an
 * identical rev, so rebuilding the same film does not re-download 30 MB on
 * every returning visitor.
 */
export function tourRev(outDir) {
  const h = createHash("sha1");
  const entries = readdirSync(outDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1));
  for (const e of entries) {
    const p = join(outDir, e.name);
    if (e.isDirectory()) for (const f of readdirSync(p).sort()) h.update(`${e.name}/${f}:${statSync(join(p, f)).size};`);
    else if (e.name !== "manifest.json") h.update(`${e.name}:${statSync(p).size};`);
  }
  return h.digest("hex").slice(0, 8);
}
