/**
 * Build the favicon set from the crest.
 *
 * The mark alone: no wordmark, no tagline, no white plate. `jecrc-crest.png`
 * is already the crest trimmed to its alpha box by `make-crest.mjs`, so the
 * only work here is padding it to a square and resampling.
 *
 * The source is 80x89. That is the crest's full extent in the only artwork
 * that exists for it, and the group's own 192px icon is a 350x100 lockup whose
 * crest is no larger, so 512 is an upscale either way. It is a crest with a
 * dozen small emblems inside it, which is soft at icon sizes regardless of how
 * many pixels it is given.
 *
 * Alpha is kept everywhere except the Apple icon: iOS ignores transparency and
 * composites onto black, which turns red line art into a smudge, so that one
 * gets the paper ground the rest of the site uses.
 *
 *   node scripts/make-icons.mjs [crest.png]
 */

import sharp from "sharp";
import fs from "node:fs/promises";

const IN = process.argv[2] ?? "public/brand/jecrc-crest.png";
const PAPER = { r: 255, g: 255, b: 255, alpha: 1 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

/** Square the crest on its own centre, with a margin so it is not clipped by
 *  the circular masks Android and iOS apply. */
async function square(size, background) {
  const pad = Math.round(size * 0.12);
  const inner = size - pad * 2;
  const art = await sharp(IN)
    .resize({ width: inner, height: inner, fit: "contain", background: CLEAR, kernel: "lanczos3" })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Minimal ICO container around PNG entries.
 *
 * Every browser that matters reads PNG-in-ICO, so there is no BMP encoder here
 * and no dependency for one: the file is a 6 byte header, a 16 byte directory
 * entry per size, then the PNGs.
 */
function ico(pngs) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const dir = [];
  for (const { size, data } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    dir.push(e);
  }
  return Buffer.concat([head, ...dir, ...pngs.map((p) => p.data)]);
}

const targets = [
  ["public/icon-192.png", await square(192, CLEAR)],
  ["public/icon-512.png", await square(512, CLEAR)],
  ["public/apple-icon.png", await square(180, PAPER)],
];
for (const [path, data] of targets) await fs.writeFile(path, data);

const sizes = [16, 32, 48];
const entries = [];
for (const size of sizes) entries.push({ size, data: await square(size, CLEAR) });
await fs.writeFile("src/app/favicon.ico", ico(entries));

for (const [path] of targets) console.log(`wrote ${path}`);
console.log(`wrote src/app/favicon.ico (${sizes.join(", ")})`);
