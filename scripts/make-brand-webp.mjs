#!/usr/bin/env node
/**
 * Re-encode the brand PNGs as lossless WebP.
 *
 *   node scripts/make-brand-webp.mjs
 *
 * The PNGs stay on disk: they are what `brand:mono` and `brand:crest` read and
 * write, and they are the format the published artwork arrives in. This is the
 * last step of that chain, and the `.webp` files are what the site actually
 * links to.
 *
 * Lossless rather than quality 88, even though 88 is smaller on the plated
 * lockup. These are flat colour and serif type on a hard edge, which is the
 * exact case lossy WebP rings on, and the mark carries the university's name
 * at the top of every screen. Measured on the current artwork:
 *
 *   lockup       57.1 KB png -> 35.7 KB lossless  (23.4 KB at q88, and ringing)
 *   lockup-mono  50.6 KB png -> 18.8 KB lossless
 *   lockup-red   66.9 KB png -> 19.0 KB lossless
 *   crest        13.4 KB png ->  4.4 KB lossless
 *
 * Requires ffmpeg on PATH, same as `tour:build`.
 */

import { execFileSync, execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? "public/brand");

if (!existsSync(dir)) {
  console.error(`✗ no such directory: ${dir}`);
  process.exit(1);
}
try {
  execSync("ffmpeg -version", { stdio: "ignore" });
} catch {
  console.error("✗ ffmpeg not found on PATH. Install it and try again.");
  process.exit(1);
}

const pngs = readdirSync(dir).filter((f) => f.endsWith(".png"));
if (!pngs.length) {
  console.log("nothing to do: no .png in " + dir);
  process.exit(0);
}

let before = 0;
let after = 0;
for (const png of pngs) {
  const src = join(dir, png);
  const out = join(dir, png.replace(/\.png$/, ".webp"));
  execFileSync("ffmpeg", [
    "-v", "error", "-y", "-i", src,
    "-c:v", "libwebp", "-lossless", "1", "-compression_level", "6",
    out,
  ]);
  const a = statSync(src).size;
  const b = statSync(out).size;
  before += a;
  after += b;
  console.log(
    `  ${png.padEnd(24)} ${(a / 1024).toFixed(1).padStart(7)} KB -> ${(b / 1024)
      .toFixed(1)
      .padStart(7)} KB`
  );
}

console.log(
  `\n✓ ${pngs.length} marks, ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(
    1
  )} KB (${Math.round((1 - after / before) * 100)}% smaller)`
);
console.log("  lib/content/site.ts links to the .webp; the .png stay as the source.");
