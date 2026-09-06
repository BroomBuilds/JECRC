import { createHash } from "node:crypto";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fingerprint of a built tour, used as the `?v=` on every frame URL.
 *
 * The frames sit behind `immutable, max-age=1y` but their paths never change
 * — /media/tour/h/avif/640/f0001.avif is the same URL for every film ever
 * built — so without this a phone that saw one cut keeps it for a year and no
 * deploy can reach it. The query is what makes the immutable claim true.
 *
 * Byte sizes only, no reads: a stat per frame, and identical output gives an
 * identical rev, so rebuilding the same film does not re-download tens of
 * megabytes on every returning visitor.
 *
 * Recursive, because the tree is now <format>/<width>/<frame> rather than
 * <width>/<frame>. A non-recursive walk hashed the directory names and none of
 * the frames inside them, which produced a rev that never changed.
 */
export function tourRev(outDir) {
  const h = createHash("sha1");

  const walk = (dir, prefix) => {
    const entries = readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : 1));
    for (const e of entries) {
      const p = join(dir, e.name);
      const key = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(p, key);
      // The manifest carries the rev, so it cannot be part of what the rev is
      // computed from.
      else if (key !== "manifest.json") h.update(`${key}:${statSync(p).size};`);
    }
  };

  walk(outDir, "");
  return h.digest("hex").slice(0, 8);
}
