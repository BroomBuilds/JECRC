#!/usr/bin/env node
/**
 * warm-tour.mjs: pull every frame of the film through the CDN once, so the
 * first real visitor is never the one who pays for a cold edge.
 *
 *   node scripts/warm-tour.mjs https://www.jecrcinstitutions.com
 *   npm run tour:warm -- https://www.jecrcinstitutions.com
 *
 * Options
 *   --concurrency <n>   requests in flight            (default 24)
 *   --tiers <list>      avif | webp | all             (default avif)
 *   --verify            re-request a sample afterwards and report HIT rate
 *
 * ---------------------------------------------------------------------------
 * Why this exists
 *
 * Measured against a deployed build, the same 100 frames, same client, same
 * connection, back to back:
 *
 *   cold at the edge (MISS, fetched from origin)    3 frames/s
 *   warm at the edge (HIT)                         32 frames/s
 *
 * Ten times. That gap is the whole of "the first visit is clunky and every
 * visit after it is perfect" — and it is NOT the browser cache, because both
 * numbers come from the same client with nothing cached locally.
 *
 * A film split into hundreds of small objects is close to the worst shape for
 * an edge cache: no single frame is requested often enough to stay resident,
 * so they age out and the next visitor to that region pays an origin round
 * trip per frame. Deploying replaces the fingerprint on every URL, which
 * empties the edge completely.
 *
 * ---------------------------------------------------------------------------
 * The limitation, stated plainly
 *
 * This warms the ONE edge location that serves the machine it runs on. Run it
 * from Jaipur and it warms the Indian or Singapore PoP, which is where the
 * audience lands. Run it from a US CI runner and it warms a US PoP and does
 * nothing for visitors in India. Run it near the audience.
 *
 * It only helps where a CDN sits in front of the origin at all. Serving
 * straight off a single Hostinger host, there is no edge to warm and this
 * script is a no-op worth skipping — the HIT rate it reports will simply stay
 * at zero because no cache-status header comes back.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

/**
 * Did this response come from an edge cache?
 *
 * Every CDN spells it differently and some spell it not at all, so this reads
 * the common ones and treats an absent header as a miss.
 */
const isHit = (r) => {
  for (const h of ["cf-cache-status", "x-cache", "x-litespeed-cache", "x-proxy-cache"]) {
    const v = (r.headers.get(h) || "").toUpperCase();
    if (v.includes("HIT")) return true;
  }
  return false;
};

const origin = argv.find((a) => a.startsWith("http"));
if (!origin) {
  console.error("usage: node scripts/warm-tour.mjs https://host [--concurrency 24] [--tiers avif|webp|all] [--verify]");
  process.exit(1);
}

const concurrency = Number(opt("concurrency", 24));
const which = String(opt("tiers", "avif"));
const verify = argv.includes("--verify");

const films = ["landscape", "portrait"].flatMap((o) => {
  try {
    return [JSON.parse(readFileSync(resolve(`src/lib/tour-manifest-${o}.json`), "utf8"))];
  } catch {
    console.warn(`! no manifest for ${o}, skipping`);
    return [];
  }
});
if (!films.length) {
  console.error("✗ no tour manifests found. Build the film first.");
  process.exit(1);
}

/** Every URL the component can ask for, in the order it will ask for them. */
const urls = [];
for (const m of films) {
  urls.push(origin + m.poster);
  for (const [key, fmt] of Object.entries(m.formats)) {
    if (which !== "all" && which !== key) continue;
    // Smallest tier first: it is the one fetched eagerly and completely, so it
    // is the one whose coldness the visitor actually feels.
    const sizes = [...fmt.sizes].sort((a, b) => a.width - b.width);
    for (const t of sizes) {
      for (let i = 0; i < m.count; i++) {
        const n = String(i + 1).padStart(m.pad, "0");
        urls.push(`${origin}${m.base}/${key}/${t.dir}/f${n}.${fmt.ext}?v=${m.rev}`);
      }
    }
  }
}

console.log(`→ ${urls.length} objects, ${concurrency} in flight, tiers=${which}`);
console.log(`→ ${origin}`);

let done = 0;
let miss = 0;
let hit = 0;
let failed = 0;
let bytes = 0;
const t0 = Date.now();

const tick = () => {
  if (done % 200 === 0 || done === urls.length) {
    const s = (Date.now() - t0) / 1000;
    process.stdout.write(
      `\r  ${done}/${urls.length}  ${(done / s).toFixed(0)}/s  ${(bytes / 1048576).toFixed(1)} MB  MISS ${miss} HIT ${hit}${failed ? `  failed ${failed}` : ""}   `
    );
  }
};

async function fetchOne(url) {
  try {
    // GET, not HEAD: a HEAD does not populate a CDN cache entry, which would
    // make this script look like it worked and change nothing.
    const r = await fetch(url, { headers: { "Accept-Encoding": "identity" } });
    const buf = await r.arrayBuffer();
    bytes += buf.byteLength;
    if (!r.ok) failed++;
    if (isHit(r)) hit++;
    else if (cs) miss++;
  } catch {
    failed++;
  }
  done++;
  tick();
}

async function run(list) {
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (next < list.length) await fetchOne(list[next++]);
  });
  await Promise.all(workers);
}

await run(urls);
const secs = (Date.now() - t0) / 1000;
console.log(`\n✓ warmed ${urls.length - failed}/${urls.length} in ${secs.toFixed(0)}s (${(bytes / 1048576).toFixed(1)} MB)`);
if (failed) console.log(`✗ ${failed} failed — check the manifest matches what is deployed`);

if (verify) {
  // Sample rather than re-walk everything: the question is whether the edge
  // kept what it was just given, and 60 spread across the film answers it.
  const sample = Array.from({ length: 60 }, (_, k) => urls[Math.floor((k / 60) * urls.length)]);
  let h = 0;
  for (const u of sample) {
    const r = await fetch(u);
    await r.arrayBuffer();
    if (isHit(r)) h++;
  }
  console.log(`✓ verify: ${h}/${sample.length} served from the edge`);
  if (h < sample.length * 0.9) {
    console.log("! low HIT rate — either the edge is evicting the film faster");
    console.log("  than it is asked for, or there is no CDN in front of the origin.");
    console.log("  Turn on Tiered Cache, and consider the atlas transport — fewer, larger objects stay resident.");
  }
}
