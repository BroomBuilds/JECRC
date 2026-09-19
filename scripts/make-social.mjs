/**
 * Render the share card and the icon set from the brand assets.
 *
 * A page shared into WhatsApp, Slack or a search result is judged on one 1200
 * by 630 rectangle, and a frame lifted from the tour film is not that: it is a
 * photograph with no name on it. This draws the card properly, once, and checks
 * it in.
 *
 * The icons come from the crest for the same reason: a browser tab and a home
 * screen need the mark, not the lockup, because the lockup is illegible at
 * 32px.
 *
 *   node scripts/make-social.mjs
 *
 * Uses the Playwright Chromium already present for the visual checks, so there
 * is no image library in the dependency tree for something that runs once per
 * brand refresh.
 */

import { chromium } from "playwright";
import fs from "node:fs/promises";

const OUT = "public";
const b64 = async (p) => (await fs.readFile(p)).toString("base64");

const lockup = await b64("brand-src/jecrc-lockup-mono.png");
const crest = await b64("brand-src/jecrc-crest.png");

const browser = await chromium.launch();

/* ---- 1200x630 share card ---------------------------------------------- */
const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await card.setContent(`
<style>
  @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;800&display=swap');
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; display: flex; flex-direction: column;
    justify-content: space-between; padding: 72px;
    background: #08080a; color: #fff;
    font-family: 'Hanken Grotesk', system-ui, sans-serif;
  }
  .glow {
    position: absolute; right: -180px; top: -180px; width: 620px; height: 620px;
    background: radial-gradient(circle, #de1819 0%, transparent 66%);
    opacity: .5; filter: blur(60px);
  }
  h1 { font-size: 86px; font-weight: 800; letter-spacing: -.045em; line-height: .96; }
  h1 em { font-style: normal; color: #de1819; }
  p { font-size: 25px; font-weight: 400; color: rgba(255,255,255,.66); max-width: 30ch; margin-top: 22px; }
  .row { display: flex; align-items: flex-end; justify-content: space-between; gap: 40px; position: relative; }
  .marks { display: flex; gap: 34px; font-size: 15px; font-weight: 600;
           letter-spacing: .16em; text-transform: uppercase; color: rgba(255,255,255,.5); }
</style>
<div class="glow"></div>
<img src="data:image/png;base64,${lockup}" style="width:300px;position:relative">
<div class="row">
  <div>
    <h1>Build Your<br><em>World</em></h1>
    <p>JECRC University Jaipur, Alwar NCR, and JECRC Foundation.</p>
  </div>
  <div class="marks">
    <span>2,104+ offers</span><span>34,000+ alumni</span><span>200+ recruiters</span>
  </div>
</div>
`);
await card.waitForTimeout(2200);
await card.screenshot({ path: `${OUT}/opengraph-image.png` });
await card.close();

/* ---- icons ------------------------------------------------------------- */
for (const [name, size, pad, bg] of [
  ["icon-192.png", 192, 26, "#ffffff"],
  ["icon-512.png", 512, 70, "#ffffff"],
  ["apple-icon.png", 180, 22, "#ffffff"],
]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`
    <style>
      * { margin: 0 }
      body { width:${size}px; height:${size}px; display:flex; align-items:center;
             justify-content:center; background:${bg}; padding:${pad}px; box-sizing:border-box }
      img { max-width:100%; max-height:100%; object-fit:contain }
    </style>
    <img src="data:image/png;base64,${crest}">
  `);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}`, omitBackground: false });
  await p.close();
  console.log("wrote", name);
}

await browser.close();

const { size } = await fs.stat(`${OUT}/opengraph-image.png`);
console.log(`wrote opengraph-image.png (${(size / 1024).toFixed(0)} kB)`);
