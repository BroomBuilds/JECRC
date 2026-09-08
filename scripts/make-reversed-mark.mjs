/**
 * A published mark, reversed to white for dark and coloured grounds.
 *
 *   node scripts/make-reversed-mark.mjs <in.png> <out.png> [--hold r,g,b]
 *   npm run brand:hospital     the hospital mark
 *   npm run brand:foundation   the foundation mark
 *
 * The published mark is built for white paper: a black wordmark, a maroon
 * shield band and heart-knot, and tan flanking curves. Two of those three
 * fail everywhere this site would use it — black type vanishes into the
 * film's dark scrim, and maroon on the crimson band is very nearly the same
 * colour as the band.
 *
 * The first attempt worked around that by standing the full-colour mark on a
 * white plate. That reads as a sticker: every other element on a chapter card
 * is type printed straight onto the film, and a white rectangle is the one
 * thing on screen that is obviously pasted over the picture rather than part
 * of it. A reversed mark is the ordinary answer to this problem and the one
 * every brand manual ships — so this makes one.
 *
 * Three ink regions, measured off the artwork rather than guessed:
 *
 *   rgb(0,0,0)        42%   the wordmark and "Infinite Care"
 *   rgb(~160,0,0)     29%   the shield's top band and the heart knot
 *   rgb(~192,192,128) 28%   the shield's flanking curves
 *
 * The wordmark and the knot go to full white. The flanking curves go to white
 * at reduced alpha instead — if all three became solid white the band and the
 * curves would fuse into one blank silhouette and the shield would lose the
 * shape that makes it recognisable. Keeping them apart by LUMINANCE rather
 * than by hue is what a reversed mark does: the structure survives, and it
 * survives on any ground rather than only on the one it was drawn for.
 *
 * The shield interior is transparent in the source, so the knot reads as white
 * line-work against whatever is behind it.
 */
import sharp from "sharp";

const IN = process.argv[2] ?? "ref/hospital logo.png";
const OUT = process.argv[3] ?? "public/brand/jecrc-hospital-mark-reversed.png";

/**
 * An optional ink colour to hold back to half alpha instead of taking to solid
 * white, given as `--hold r,g,b`.
 *
 * Only marks with two adjacent shapes of different colour need it. The
 * hospital shield does: its top band and its flanking curves touch, so taking
 * both to solid white would fuse them into one blank silhouette. A mark drawn
 * in a single colour — the foundation roundel, for one — needs no second tone
 * and takes the default of none.
 */
const holdArg = process.argv.indexOf("--hold");
const HOLD = holdArg > -1 && process.argv[holdArg + 1]
  ? process.argv[holdArg + 1].split(",").map(Number)
  : null;

/** How close a pixel has to be to a reference colour to count as that region. */
const near = (r, g, b, [tr, tg, tb], tol = 70) =>
  Math.abs(r - tr) <= tol && Math.abs(g - tg) <= tol && Math.abs(b - tb) <= tol;

/** How far the held-back tone is knocked down, when there is one. */
const HOLD_ALPHA = 0.5;

const src = sharp(IN).ensureAlpha();
const { width, height } = await src.metadata();
const { data } = await src.raw().toBuffer({ resolveWithObject: true });

let held = 0;
let solid = 0;
for (let i = 0; i < data.length; i += 4) {
  const a = data[i + 3];
  if (a === 0) continue;
  const isHeld = HOLD && near(data[i], data[i + 1], data[i + 2], HOLD);
  data[i] = 255;
  data[i + 1] = 255;
  data[i + 2] = 255;
  if (isHeld) {
    data[i + 3] = Math.round(a * HOLD_ALPHA);
    held++;
  } else solid++;
}

const out = sharp(data, { raw: { width, height, channels: 4 } });
await out.clone().png().toFile(OUT);
await out.clone().webp({ quality: 94 }).toFile(OUT.replace(/\.png$/, ".webp"));
console.log(
  `wrote ${OUT} and .webp — ${width}x${height}, ${solid} px solid white` +
    (HOLD ? `, ${held} px held at ${HOLD_ALPHA}` : "")
);
