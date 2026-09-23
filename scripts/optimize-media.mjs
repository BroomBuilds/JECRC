#!/usr/bin/env node
/**
 * Re-encode everything in public/ that the page links to, and report what it
 * cost.
 *
 *   node scripts/optimize-media.mjs          # write
 *   node scripts/optimize-media.mjs --dry    # measure only
 *
 * Idempotent: run it again after dropping a new photograph in and it re-encodes
 * that one. Sources stay on disk, same as `brand:webp` — they are what the
 * artwork arrives as and what a re-crop starts from. The `.webp` is what ships.
 *
 * Uses sharp, which arrives with Next. This absorbed `scripts/make-brand-webp.mjs`,
 * which did the same job for the four brand marks by shelling out to ffmpeg:
 * two encoders for one output format, and ffmpeg an undeclared system
 * prerequisite that a fresh clone discovers by failing. Sharp's lossless
 * output on that artwork is byte-for-byte the size ffmpeg's was — 34.9, 18.3,
 * 18.6 and 4.3 KB — so nothing about the shipped marks changed in the move.
 *
 * ---- why each group is encoded the way it is ----
 *
 * PHOTOS      q80. Photographs of a campus: continuous tone, no hard edges to
 *             ring, and q80 WebP is visually indistinguishable from the q3 JPEG
 *             these came out of ffmpeg as, at about a third the bytes.
 *
 * LOGOS       lossless. Flat colour, hard edges, other people's trademarks.
 *             Lossy WebP rings on exactly this and a ringed logo is a logo
 *             drawn wrong. Lossless is also usually SMALLER here, because flat
 *             colour is what its predictor is for.
 *
 * RESIZED     the medical renders shipped at up to 1800px into a frame that is
 *             never wider than about 700 CSS pixels. 1400 is still 2x on the
 *             widest layout and is where the file stops paying for pixels
 *             nobody sees.
 *
 * ICONS       stay PNG and are only recompressed. Favicons, the Apple touch
 *             icon and the Open Graph card are read by other people's software
 *             — Safari, WhatsApp, LinkedIn — and WebP support across that set
 *             is not something to find out about in production.
 */

import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, basename, sep } from "node:path";

const DRY = process.argv.includes("--dry");

/**
 * The brand marks' working format, and where the site's copies land.
 *
 * `brand-src/` is deliberately NOT under `public/`. Next serves everything in
 * `public/` verbatim, so a PNG kept there for a script to read is a PNG
 * deployed for nobody to fetch.
 */
const BRAND_SRC = "brand-src";
const BRAND_OUT = "public/brand";
const kb = (n) => (n / 1024).toFixed(1).padStart(7) + " KB";

let before = 0;
let after = 0;
const rows = [];

function record(src, out, a, b) {
  before += a;
  after += b;
  rows.push(`  ${src.split(sep).join("/").padEnd(42)} ${kb(a)} -> ${kb(b)}  ${basename(out)}`);
}

/** Every file directly under `dir` matching `re`. */
const list = (dir, re) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => re.test(f)).sort() : [];

/**
 * Read through a Buffer rather than by path, and write the same way.
 *
 * `sharp(path).toFile(sameDir)` holds the input open on Windows for as long as
 * the pipeline lives, and re-encoding a .webp over itself then fails with
 * EPERM. A Buffer has no handle to still be holding.
 */
async function toWebp(
  src,
  { lossless = false, quality = 80, width = null, outDir = null, outName = null } = {}
) {
  // Beside the input by default. `outDir` is for the brand marks, whose
  // working PNGs live outside `public/` so they are never deployed — see the
  // brand block below. `outName` is for sources whose filename is not the name
  // the site asks for, which is every school photograph.
  const named = outName ?? basename(src).replace(/\.(png|jpe?g|avif|webp)$/i, ".webp");
  const out = outDir ? join(outDir, named) : src.replace(/\.(png|jpe?g|avif|webp)$/i, ".webp");
  const a = statSync(src).size;
  const input = sharp(readFileSync(src));

  // Where the source IS the output, this runs a second time on its own result.
  // A lossy re-encode of a lossy file loses a little every pass and gets a
  // smaller number for it, so the size test would happily keep degrading the
  // renders on every run. The only reason to touch a .webp in place is that it
  // is still wider than the frame it lands in; once it is not, leave it.
  if (src === out) {
    const w = (await input.metadata()).width ?? 0;
    if (!width || w <= width) {
      record(src, out, a, a);
      return;
    }
  }

  let p = input;
  if (width) p = p.resize({ width, withoutEnlargement: true });
  const buf = await p
    .webp(lossless ? { lossless: true, effort: 6 } : { quality, effort: 6 })
    .toBuffer();

  if (!DRY) writeFileSync(out, buf);
  record(src, out, a, buf.length);
}

async function repng(src) {
  const buf = await sharp(readFileSync(src)).png({ compressionLevel: 9, effort: 10 }).toBuffer();
  const a = statSync(src).size;
  if (!DRY && buf.length < a) writeFileSync(src, buf);
  record(src, src, a, Math.min(a, buf.length));
}

// ---- photographs ------------------------------------------------------
for (const f of list("public/media", /\.jpe?g$/i)) await toWebp(join("public/media", f));
for (const f of list("public/media/stills", /\.jpe?g$/i))
  await toWebp(join("public/media/stills", f));

// ---- the school photographs -------------------------------------------
// The group's own artwork, which arrives in `ref/images` under human names
// with spaces in them and in whatever format the phone or the stock site gave
// it — mostly AVIF. This map is the only place those names meet the slugs
// `content/schools.ts` asks for, so it doubles as the record of which picture
// belongs to which school.
//
// `ref/` is gitignored, the same as the films the tour is built from: the
// sources are working assets and the encoded `.webp` under `public/` is what
// ships and what is committed. A missing source is skipped rather than being
// an error, so a school whose photograph has not arrived keeps the one it has
// — which is exactly the case for Economics.
//
// 1024px because the frame is about 512 CSS pixels wide, so that is 2x on a
// retina screen. `withoutEnlargement` inside `toWebp` means a source smaller
// than that is encoded at its own size rather than blown up. The 3:4 crop is
// CSS, not done here, so the whole frame ships and the component chooses.
// See public/media/schools/README.md.
const SCHOOL_PHOTOS = {
  "engineering and tech.jpg": "engineering-technology.webp",
  "computer applications.avif": "computer-applications.webp",
  "business.avif": "business.webp",
  "sciences.avif": "sciences.webp",
  "humanities.avif": "humanities-social-sciences.webp",
  "law.avif": "law.webp",
  "mass com.avif": "mass-communication.webp",
  "design.avif": "design.webp",
  "applied health.avif": "allied-health-sciences.webp",
  "hospitality.avif": "hospitality.webp",
};

for (const [src, outName] of Object.entries(SCHOOL_PHOTOS))
  if (existsSync(join("ref/images", src)))
    await toWebp(join("ref/images", src), {
      quality: 80,
      width: 1024,
      outDir: "public/media/schools",
      outName,
    });

// ---- renders, resized down to the frame they land in ------------------
for (const f of list("public/media/medical", /\.webp$/i))
  await toWebp(join("public/media/medical", f), { quality: 74, width: 1400 });

// ---- other people's marks ---------------------------------------------
for (const f of list("public/media/recruiters", /\.png$/i))
  await toWebp(join("public/media/recruiters", f), { lossless: true });

// ---- the brand marks --------------------------------------------------
// Lossless. Flat colour, serif type on a hard edge, and the mark carries the
// university's name at the top of every screen: this is the exact case lossy
// WebP rings on.
//
// IN FROM `brand-src/`, OUT TO `public/brand/`. The PNGs are the working
// format — what `brand:mono` and `brand:crest` read and write, and what the
// published artwork arrives as — and they used to sit in `public/brand`
// beside their own output. Everything in `public/` is deployed, so that was
// 572 KB of intermediates shipped to every visitor's CDN edge for a set of
// files the site never links. Nothing requests them, so it cost no visitor a
// byte; it cost the deploy, and it made "which of these is the real asset?"
// a question anyone touching the brand pipeline had to answer from the code.
const BRAND_LOSSY = new Set([
  "jecrc-crest-lg.png",
  "jecrc-lockup-university.png",
  "jecrc-lockup-reversed.png",
]);

for (const f of list(BRAND_SRC, /\.png$/i))
  if (!BRAND_LOSSY.has(f))
    await toWebp(join(BRAND_SRC, f), { lossless: true, outDir: BRAND_OUT });

// ---- the university lockup --------------------------------------------
// Lossy and resized, for the same reason the crest below is. The new artwork
// is the full crest — dozens of hairline glyphs inside the shield, every one
// of them antialiased — beside the wordmark, and lossless has nothing to
// predict in that: 145 KB against 86 KB at q92, on a mark the navbar marks
// `priority`.
//
// 700px because 222 CSS pixels is the widest this is ever drawn — `PLATE.mark`
// in the navbar — so 700 is still over 3x on a retina screen and next/image
// downscales from it anyway. The source stays at 1200 as the working master.
for (const f of ["jecrc-lockup-university.png", "jecrc-lockup-reversed.png"])
  if (existsSync(join(BRAND_SRC, f)))
    await toWebp(join(BRAND_SRC, f), { quality: 92, width: 700, outDir: BRAND_OUT });

// ---- the crest at ending size -----------------------------------------
// Lossy, unlike the four marks in `brand:webp`. This one is not flat colour —
// it is the full crest, gradients and hairline rule work — so lossless has
// nothing to predict and lands at 128 KB against 78 KB at q88. It is also the
// only mark that is never drawn near its own size: it appears once, at the end
// of the film, at cap height.
if (existsSync(join(BRAND_SRC, "jecrc-crest-lg.png")))
  await toWebp(join(BRAND_SRC, "jecrc-crest-lg.png"), { quality: 88, outDir: BRAND_OUT });

// ---- icons and the social card: PNG in, PNG out ------------------------
for (const f of ["icon-192.png", "icon-512.png", "apple-icon.png", "opengraph-image.png"])
  if (existsSync(join("public", f))) await repng(join("public", f));

console.log(rows.join("\n"));
console.log(
  `\n${DRY ? "would save" : "✓"} ${rows.length} files, ${(before / 1024).toFixed(1)} KB -> ${(
    after / 1024
  ).toFixed(1)} KB (${Math.round((1 - after / before) * 100)}% smaller)`
);
