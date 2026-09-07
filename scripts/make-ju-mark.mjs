/**
 * The group mark for the tour's opening frame: crest in brand red, wordmark in
 * white.
 *
 *   node scripts/make-ju-mark.mjs [in.png] [out.png] [#crest] [#word]
 *   npm run brand:ju
 *
 * Not `make-mono-logo.mjs`. That script derives alpha from the source's
 * DARKNESS, which is right for artwork sitting on an opaque white plate and
 * wrong for this one: `ref/JU logo.png` already carries a clean alpha channel,
 * so re-deriving it threw away the trademark glyph's crisp edge and rendered
 * the wordmark at partial opacity — grey when keyed white, muddy when keyed red.
 *
 * This keeps the artwork's own alpha exactly as drawn — every shape, the
 * hairlines inside the crest, and the ™ — and only repaints the ink.
 *
 * Two tones, because one does not work over film. All-red loses the wordmark:
 * red has neither the luminance of white nor the mass of a display face, and
 * at body size over a moving picture it is the first thing to go. All-white
 * throws away the crest, which is the only part of this mark anyone recognises
 * at a glance. Red crest, white wordmark keeps the recognisable half in brand
 * colour and the readable half legible.
 *
 * The split is found rather than hardcoded: the crest and the type are
 * separated by a band of fully transparent columns, so the widest such gap
 * near the middle of the artwork is the boundary. A redrawn logo with
 * different proportions still splits in the right place.
 */
import sharp from "sharp";

const IN = process.argv[2] ?? "ref/JU logo.png";
const OUT = process.argv[3] ?? "public/brand/ju-mark.png";
const CREST = (process.argv[4] ?? "#df1919").replace("#", "");
const WORD = (process.argv[5] ?? "#ffffff").replace("#", "");
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const [cr, cg, cb] = rgb(CREST);
const [wr, wg, wb] = rgb(WORD);

const src = sharp(IN).ensureAlpha();
const { width, height } = await src.metadata();
const { data } = await src.raw().toBuffer({ resolveWithObject: true });

/** Columns that carry no ink at all. */
const empty = new Array(width).fill(true);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > 16) empty[x] = false;
  }
}

// The widest empty run that is not the margin at either end. On the shipped
// artwork that is columns 492-555, the channel between the crest and the J.
let best = { start: 0, len: 0 };
for (let x = 0, run = 0; x <= width; x++) {
  if (x < width && empty[x]) {
    run++;
    continue;
  }
  const start = x - run;
  if (run > best.len && start > width * 0.08 && x < width * 0.92) best = { start, len: run };
  run = 0;
}
if (!best.len) {
  console.error("✗ no gap found between crest and wordmark; cannot split the mark");
  process.exit(1);
}
const split = Math.round(best.start + best.len / 2);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (data[i + 3] === 0) continue;
    const crest = x < split;
    data[i] = crest ? cr : wr;
    data[i + 1] = crest ? cg : wg;
    data[i + 2] = crest ? cb : wb;
  }
}

const out = sharp(data, { raw: { width, height, channels: 4 } });
await out.clone().png().toFile(OUT);
await out.clone().webp({ quality: 94 }).toFile(OUT.replace(/\.png$/, ".webp"));
console.log(
  `wrote ${OUT} and .webp — ${width}x${height}, split at x=${split} ` +
    `(gap ${best.start}-${best.start + best.len - 1}), crest #${CREST}, wordmark #${WORD}`
);
