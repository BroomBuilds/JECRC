/**
 * Derive a flat-colour, transparent-background lockup from the brand PNG.
 *
 * The lockup as published sits on an opaque white plate, which is correct on
 * the white navbar and useless over the film: a CSS invert turns the plate
 * white too and you get a rectangle. So the artwork is keyed out once, here,
 * rather than worked around in three components.
 *
 * Alpha is taken from the source's darkness, so the crest's hairlines and the
 * type's antialiased edges survive instead of being thresholded into jaggies.
 *
 *   node scripts/make-mono-logo.mjs [in.png] [out.png] [#hex]
 *
 * Uses the Playwright Chromium already present for visual checks; it is the
 * only image decoder in the toolchain and this runs once per brand refresh.
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const IN = process.argv[2] ?? "public/brand/jecrc-lockup.png";
const OUT = process.argv[3] ?? "public/brand/jecrc-lockup-mono.png";
/** Flat colour to paint the keyed artwork in. Default white, for dark grounds. */
const INK = (process.argv[4] ?? "#ffffff").replace("#", "");
const RGB = [0, 2, 4].map((i) => parseInt(INK.slice(i, i + 2), 16));

/**
 * Luma below which a neutral pixel still counts as ink, for the few black
 * marks (the trademark glyph, the rule between the two crests).
 */
const DARK_FLOOR = 150;

/** How hard to push saturated pixels to full opacity. */
const CHROMA_GAIN = 1.35;

const source = await fs.readFile(IN);
const browser = await chromium.launch();
const page = await browser.newPage();

// A data URL keeps the canvas untainted, so getImageData works.
await page.setContent(
  `<img id="src" src="data:image/png;base64,${source.toString("base64")}">`
);
await page.waitForFunction(() => {
  const img = document.getElementById("src");
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
});

const dataUrl = await page.evaluate(({ DARK_FLOOR, CHROMA_GAIN, RGB }) => {
  const img = document.getElementById("src");
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = frame.data;

  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const a = px[i + 3];

    px[i] = RGB[0];
    px[i + 1] = RGB[1];
    px[i + 2] = RGB[2];

    // The artwork sits entirely on the opaque plate, so any pixel that is not
    // fully opaque belongs to the plate's own antialiased outline. Those
    // pixels are stored as transparent BLACK (0,0,0,29 and similar), which any
    // darkness test reads as solid ink and paints back as a ghost outline of
    // the shield. Discarding them outright is the whole fix.
    if (a < 250) {
      px[i + 3] = 0;
      continue;
    }

    // Key on colour rather than brightness: the artwork is JECRC red and so
    // strongly saturated, while the plate is neutral.
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);

    // The few genuinely black marks (the trademark glyph, the rule between the
    // two crests) have no chroma to key on, so they come in on darkness.
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    const dark = (Math.max(0, DARK_FLOOR - luma) * 255) / DARK_FLOOR;

    px[i + 3] = Math.round(Math.min(255, Math.max(chroma * CHROMA_GAIN, dark)));
  }

  ctx.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}, { DARK_FLOOR, CHROMA_GAIN, RGB });

await browser.close();

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));

const { size } = await fs.stat(OUT);
console.log(`wrote ${OUT} (${(size / 1024).toFixed(1)} kB)`);
