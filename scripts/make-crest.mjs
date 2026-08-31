/**
 * Cut the standalone crest out of the lockup.
 *
 * The `jecrc-mark.png` originally pulled off the live site turned out to be an
 * unrelated white X, not the crest, so the mark is derived from the lockup
 * instead: take the left fifth, then trim to the alpha bounding box so the
 * result is the crest and nothing else.
 *
 *   node scripts/make-crest.mjs [in.png] [out.png]
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";

const IN = process.argv[2] ?? "public/brand/jecrc-lockup-red.png";
const OUT = process.argv[3] ?? "public/brand/jecrc-crest.png";
/** The crest sits inside the first fifth of the lockup, ahead of the wordmark. */
const SLICE = 0.2;

const source = await fs.readFile(IN);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<img id="src" src="data:image/png;base64,${source.toString("base64")}">`);
await page.waitForFunction(() => {
  const img = document.getElementById("src");
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
});

const out = await page.evaluate((SLICE) => {
  const img = document.getElementById("src");
  const w = Math.round(img.naturalWidth * SLICE);
  const h = img.naturalHeight;

  const cut = document.createElement("canvas");
  cut.width = w;
  cut.height = h;
  const cx = cut.getContext("2d");
  cx.drawImage(img, 0, 0);

  // Trim to the alpha bounding box, so the crest is not floating in whatever
  // padding the lockup happened to carry.
  const px = cx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (px[(y * w + x) * 4 + 3] < 16) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;

  const pad = 2;
  const cw = x1 - x0 + 1 + pad * 2;
  const ch = y1 - y0 + 1 + pad * 2;
  const trimmed = document.createElement("canvas");
  trimmed.width = cw;
  trimmed.height = ch;
  trimmed.getContext("2d").drawImage(cut, x0 - pad, y0 - pad, cw, ch, 0, 0, cw, ch);
  return { url: trimmed.toDataURL("image/png"), w: cw, h: ch };
}, SLICE);

await browser.close();
if (!out) throw new Error("nothing opaque in the slice; check SLICE");

await fs.writeFile(OUT, Buffer.from(out.url.split(",")[1], "base64"));
console.log(`wrote ${OUT} (${out.w}x${out.h})`);
