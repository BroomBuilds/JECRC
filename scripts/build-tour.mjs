#!/usr/bin/env node
/**
 * build-tour.mjs: turn a video into the scroll-driven tour.
 *
 *   node scripts/build-tour.mjs <video> [options]
 *
 * Options
 *   --fps <n>        frames extracted per second of video   (default 18)
 *   --start <sec>    trim from                              (default 0)
 *   --end <sec>      trim to                                (default end of file)
 *   --widths <list>  AVIF widths, widest first, SPINE LAST  (default 1400,640)
 *   --webp <n>       width of the single WebP fallback tier (default 1100)
 *   --crf <n>        AVIF quality for the display tier      (default 36)
 *   --quality <n>    WebP quality 0-100                     (default 50)
 *   --max <n>        hard cap on frame count                (default 900)
 *   --stills <n>     section stills pulled from this film   (default 0)
 *   --keep <frac>    fraction of source HEIGHT kept           (default 1)
 *   --anchor <list>  where that window sits, one per shot     (default 0.5)
 *   --out <dir>      output dir  (default public/media/tour/h)
 *
 * Writes:
 *   <out>/avif/<width>/f0001.avif …     every AVIF tier
 *   <out>/webp/<width>/f0001.webp …     the fallback tier
 *   <out>/poster.webp
 *   <out>/manifest.json                 <- the component reads only this
 *
 * Requires ffmpeg and ffprobe on PATH.
 *
 * ---------------------------------------------------------------------------
 * Why two formats and two AVIF tiers
 *
 * Measured on this footage, all-intra, which is the only kind of AVIF a
 * browser can decode one frame at a time:
 *
 *   WebP q50 @1100   33.7 KB/frame      <- the fallback tier
 *   AVIF crf36 @1920  33.5 KB/frame     <- the display tier, native width
 *   AVIF crf36 @1400  22.2 KB/frame
 *   AVIF crf46 @640    2.5 KB/frame     <- the spine
 *
 * So AVIF buys about a third off WebP at the same width, or the SAME bytes at
 * the source's full 1920 — which is what ships, because the film is drawn to
 * cover the stage and a 1440x900 window at 2x asks for about 2,800 device
 * pixels across. Anything narrower than the source is upscaled before it is
 * ever seen.
 *
 * The earlier numbers here claimed 8.9 KB/frame at 1400 and a fifth of WebP.
 * Those were inter frames — see `-g 1` below — and no browser could decode
 * any of them.
 *
 * The WebP tier is the fallback for browsers without AVIF (Safari below 16,
 * some Android WebViews — a few percent). It is built at the width the site
 * shipped before, so those visitors get exactly the old experience and never a
 * worse one.
 *
 * The small AVIF tier is the SPINE: strided across the whole film it gives
 * complete end-to-end coverage for well under a megabyte, so the tour is
 * usable everywhere before the first caption has been read. It is not a
 * separate build output — the component simply strides over this tier, which
 * is why `spineStride` is recorded in the manifest rather than a frame set.
 */

import { execFileSync, execSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, statSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { tourRev } from "./tour-rev.mjs";
import { findCuts } from "./find-cuts.mjs";

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith("--")) {
  console.error("usage: node scripts/build-tour.mjs <video> [--fps 18] [--widths 1400,640] [--out public/media/tour/h]");
  process.exit(1);
}

const input = resolve(argv[0]);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const fps       = Number(opt("fps", 18));
const start     = Number(opt("start", 0));
const endArg    = opt("end", null);
const widths    = String(opt("widths", "1400,640")).split(",").map((n) => parseInt(n, 10));
const webpWidth = Number(opt("webp", 1100));
const crf       = Number(opt("crf", 36));
const quality   = Number(opt("quality", 50));
const maxFrames = Number(opt("max", 900));
const stills    = Number(opt("stills", 0));
const keep      = Number(opt("keep", 1));
const anchorArg = String(opt("anchor", "0.5"));
const outDir    = resolve(opt("out", "public/media/tour/h"));

if (!(keep > 0 && keep <= 1)) {
  console.error(`✗ --keep must be over 0 and at most 1, got ${keep}`);
  process.exit(1);
}
const anchorList = anchorArg.split(",").map((a) => Number(a.trim()));
if (anchorList.some((a) => !(a >= 0 && a <= 1))) {
  console.error(`✗ --anchor takes values from 0 (top) to 1 (bottom), got ${anchorArg}`);
  process.exit(1);
}

if (!existsSync(input)) {
  console.error(`✗ no such file: ${input}`);
  process.exit(1);
}
/**
 * Resolve ffmpeg and ffprobe.
 *
 * `$FFMPEG` / `$FFPROBE` win if set. They exist because a PATH that works in
 * one shell does not always work in Node: a Windows box with ffmpeg installed
 * by winget gets Git Bash symlinks in WinGet\Links, which Git Bash resolves and
 * cmd.exe — the shell Node spawns — does not. The binary is on PATH, `which`
 * finds it, and every execFileSync still fails. Point these at the real .exe.
 */
const bins = {};
for (const name of ["ffmpeg", "ffprobe"]) {
  const override = process.env[name.toUpperCase()];
  const candidate = override || name;
  try {
    execSync(`"${candidate}" -version`, { stdio: "ignore" });
    bins[name] = candidate;
  } catch {
    console.error(`✗ ${name} not runnable${override ? ` at ${override}` : " from PATH"}.`);
    console.error(`  Install it, or point at it directly:  ${name.toUpperCase()}=/path/to/${name}.exe npm run tour:build …`);
    process.exit(1);
  }
}
const FFMPEG = bins.ffmpeg;
const FFPROBE = bins.ffprobe;

const probe = (entries) =>
  execFileSync(FFPROBE, ["-v","error","-select_streams","v:0","-show_entries",entries,"-of","csv=p=0",input])
    .toString().trim().split(/[\n,]/)[0];

const srcDuration = Number(
  execFileSync(FFPROBE, ["-v","error","-show_entries","format=duration","-of","csv=p=0",input]).toString().trim()
);
const srcW = Number(probe("stream=width"));
const srcH = Number(probe("stream=height"));
const end  = endArg !== null ? Number(endArg) : srcDuration;
const span = Math.max(0, end - start);

let effFps = fps;
if (span * fps > maxFrames) {
  effFps = Math.max(1, Math.floor(maxFrames / span));
  console.log(`! ${Math.round(span * fps)} frames would exceed --max ${maxFrames}; dropping to ${effFps} fps`);
}

const orientation = srcH > srcW ? "portrait" : "landscape";
console.log(`→ source      ${srcW}×${srcH} (${orientation}), ${srcDuration.toFixed(2)}s`);
console.log(`→ segment     ${start}s … ${end.toFixed(2)}s  (${span.toFixed(2)}s)`);
console.log(`→ sampling    ${effFps} fps  ≈ ${Math.round(span * effFps)} frames per tier`);

// ---------------------------------------------------------------------------
// Cut detection
//
// A scroll-scrubbed montage cannot flow. Played at 25 fps a cut passes in 40 ms
// and the eye reads it as film grammar; under a scrub the VISITOR controls the
// timing, so the same cut becomes one picture being replaced by an unrelated
// picture at whatever speed a thumb chose, with no motion carrying the eye
// through it. It reads as breakage rather than editing. The component fixes
// that by dissolving across each cut instead of swapping — but it can only do
// so if it knows where they are, which is what this pass finds.
//
// Mean luma difference between consecutive SOURCE frames. Normal motion in this
// footage sits around 4 on a 0-255 scale; a cut lands at 40-70.
//
// A bare threshold is not enough. This film contains a fast dolly through
// foreground trees that holds a difference of ~23 for forty-seven consecutive
// frames — far above any sane threshold, and not a cut at all. What separates
// them is shape, not height: a cut is an ISOLATED SPIKE, sustained motion is a
// PLATEAU. So a frame qualifies only if it also stands well clear of its own
// neighbourhood, which the plateau by definition cannot do.
function detectCuts() {
  process.stdout.write("  … detecting cuts ");
  const out = execFileSync(FFMPEG, [
    "-v","error","-i",input,
    "-vf","tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-",
    "-an","-f","null","-",
  ], { maxBuffer: 1 << 28 }).toString();

  const d = [...out.matchAll(/YAVG=([0-9.]+)/g)].map((m) => Number(m[1]));
  const n = d.length;

  // +1 on each index because tblend's first output compares frames 0 and 1, so
  // index i is the difference ARRIVING AT source frame i+1 — the first frame of
  // the new shot, which is the one the dissolve has to land on.
  const cuts = [];
  for (const i of findCuts(d)) {
    const t = ((i + 1) / (n + 1)) * srcDuration;
    if (t < start || t > end) continue;
    cuts.push(Number(((t - start) / span).toFixed(4)));
  }
  console.log(`→ ${cuts.length}`);
  return cuts;
}

const cuts = detectCuts();
if (cuts.length) console.log(`    at ${cuts.map((c) => c.toFixed(3)).join(", ")}`);

// Re-detect against an existing build and rewrite just the cut list. Detection
// is a heuristic with three constants in it, and re-encoding two thousand AVIF
// frames to try a different RATIO is not a sane iteration loop. The frames are
// untouched, so the rev is unchanged and no visitor re-downloads anything.
if (argv.includes("--cuts-only")) {
  const mPath = join(outDir, "manifest.json");
  if (!existsSync(mPath)) {
    console.error(`✗ --cuts-only needs an existing build at ${outDir}`);
    process.exit(1);
  }
  const m = JSON.parse(readFileSync(mPath, "utf8"));
  m.cuts = cuts;
  writeFileSync(mPath, JSON.stringify(m, null, 2));
  writeFileSync(resolve(`src/lib/tour-manifest-${m.orientation}.json`), JSON.stringify(m, null, 2));
  console.log(`✓ ${cuts.length} cuts written to ${mPath} (frames untouched, rev still ${m.rev})`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Reframing
//
// The portrait cut of this film is the landscape edit re-framed to 9:16, and
// re-framing a drone shot that way puts the horizon near the middle: the
// aerials carry about half a frame of empty sky, and on a phone — where the
// source is TALLER than the viewport is, so the cover fit uses all of its
// height and trims the sides — every pixel of that sky is on screen. The
// campus the shot is of ends up in the bottom third, under the caption.
//
// So the film can be re-framed here: keep a window of the source height and
// choose, PER SHOT, where that window sits. The aerials take it from the
// bottom and lose the sky; the gate and the renders have their dead space at
// the other end — foreground pavement, an empty plaza — and take it from
// nearer the top.
//
// Done at build time rather than in the canvas because the crop lands BEFORE
// the downscale: cropping a quarter off 1920 and then fitting 1440 into the
// tier width keeps every pixel the tier can hold. The same reframe done at
// runtime is an upscale of frames already built for the old framing, which is
// the same picture, softer, in more bytes.
//
// Shot boundaries are the cuts detected above rather than times written out
// here, so a re-cut of the same edit keeps its framing without anything being
// retyped. Only the anchors are given, in film order, one per shot.
if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

/** Height of one frame after reframing. Even, because yuv420p needs it. */
const frameH = keep >= 1 ? srcH : Math.round((srcH * keep) / 2) * 2;
/** Top edge of the window for an anchor: 0 is the top of the source, 1 the bottom. */
const yFor = (a) => Math.round((srcH - frameH) * a);

/**
 * The `crop` filter, or "" when there is nothing to do.
 *
 * `w` and `h` are fixed — crop evaluates them once and a filter cannot change
 * its output size mid-stream — so the shot-by-shot decision is `y` alone,
 * which crop DOES re-evaluate every frame. Each step lands on a cut, where the
 * picture is being replaced anyway, so the jump is invisible.
 *
 * Commas inside the expression are escaped: in a filtergraph an unescaped one
 * ends the filter.
 */
function reframeFilter() {
  if (frameH === srcH) return "";
  const shots = cuts.length + 1;
  if (anchorList.length !== shots && anchorList.length !== 1) {
    console.log(
      `! --anchor has ${anchorList.length} values for ${shots} shots;` +
      ` the last one covers the rest`
    );
  }
  const anchorAt = (k) => anchorList[Math.min(k, anchorList.length - 1)];
  // Innermost first: the last shot is the else of every test before it.
  let y = String(yFor(anchorAt(cuts.length)));
  for (let k = cuts.length - 1; k >= 0; k--) {
    y = `if(lt(t\\,${(cuts[k] * span).toFixed(3)})\\,${yFor(anchorAt(k))}\\,${y})`;
  }
  return `crop=${srcW}:${frameH}:0:${y},`;
}
const reframe = reframeFilter();

/**
 * The same window, for a single frame pulled with `-ss`.
 *
 * Input seeking restarts the clock at the frame it lands on, so the time-based
 * expression above would read 0 and hand every still the opening shot's
 * anchor. This resolves the shot here and writes a plain number instead.
 */
function reframeAt(t) {
  if (!reframe) return "";
  const shots = cuts.length + 1;
  let k = 0;
  while (k < cuts.length && t >= cuts[k] * span) k++;
  const a = anchorList[Math.min(k, Math.min(shots, anchorList.length) - 1)];
  return `crop=${srcW}:${frameH}:0:${yFor(a)},`;
}
if (reframe) {
  console.log(
    `→ reframe     keeping ${Math.round(keep * 100)}% of the height` +
    ` (${srcW}×${frameH}), anchors ${anchorList.join(", ")}`
  );
}

const heightFor = (w) => Math.round((w * frameH) / srcW / 2) * 2;

/** One ffmpeg pass: the whole segment, one width, one codec. */
function extract(fmt, w, codecArgs) {
  const dir = join(outDir, fmt, String(w));
  mkdirSync(dir, { recursive: true });

  const args = ["-v","error","-y"];
  if (start > 0) args.push("-ss", String(start));
  args.push("-i", input);
  if (endArg !== null || span < srcDuration) args.push("-t", String(span));
  args.push("-vf", `${reframe}fps=${effFps},scale=${w}:-2:flags=lanczos`);
  args.push(...codecArgs);
  // image2 must be forced: given an .avif pattern and an AV1 encoder, ffmpeg
  // otherwise writes ONE animated AVIF sequence instead of a still per frame.
  args.push("-f", "image2", join(dir, `f%04d.${fmt}`));

  process.stdout.write(`  … ${fmt} ${w}px `);
  const t0 = Date.now();
  execFileSync(FFMPEG, args, { stdio: ["ignore","ignore","inherit"] });

  const files = readdirSync(dir).filter((f) => f.endsWith(fmt)).sort();
  const bytes = files.reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  console.log(
    `→ ${files.length} frames, ${(bytes / 1048576).toFixed(1)} MB` +
    ` (${(bytes / files.length / 1024).toFixed(1)} KB/frame, ${((Date.now() - t0) / 1000).toFixed(0)}s)`
  );
  return { width: w, height: heightFor(w), dir: String(w), count: files.length, bytes };
}

// yuv420p rather than ffmpeg's default 444: half the chroma, no visible
// difference on soft-focus footage, and the only subsampling every AVIF decoder
// is fast at. row-mt keeps libaom on all cores.
//
// `-g 1` is the whole ballgame and was missing.
//
// libaom is a VIDEO encoder. Handed a sequence and an .avif pattern it does
// what a video encoder does: frame one is a keyframe and the rest are INTER
// frames, each written into its own AVIF container holding a delta against a
// picture that is not in the file. The containers are valid — `ftypavif`, the
// right dimensions in `ispe`, and ffprobe reads them back happily — so this
// looks like a working build right up until something tries to decode the
// pixels. Nothing can. 502 of the 503 frames the last build wrote are
// undecodable in Chrome, Safari and Firefox alike, which is why every visitor
// has silently been served the WebP fallback: a smaller picture, five times
// the bytes, and the softness that prompted this.
//
// It is also why the byte figures in the header above were too good to be
// true. 6.5 KB for a 1400x788 still is not compression, it is a delta frame.
// All-intra, the same frame is 22 KB — still a third less than the WebP tier
// at a larger size, which is the real number.
//
// `enable-keyframe-filtering=0` and `-lag-in-frames 0` go with it, and both
// are load-bearing rather than tuning. libaom runs a temporal filter over
// keyframes and holds a lookahead to feed it; when EVERY frame is a keyframe
// it over-allocates against both and the encoder dies — in
// smooth_filter_noise() at 1400, and with a plain access violation at 1920.
// A still picture has no neighbours to filter against and nothing to look
// ahead to, so neither costs a byte of quality here. Without the pair, this
// crashes partway through the film rather than writing anything wrong, which
// at least fails loudly.
//
// Check after any change to this: decode the frames, do not just probe them.
//   ffmpeg -v error -i f0100.avif -frames:v 1 -f null -
const avifArgs = (q) => [
  "-c:v","libaom-av1","-crf",String(q),"-cpu-used","6",
  "-row-mt","1","-threads",String(ENC_THREADS),"-pix_fmt","yuv420p",
  "-g","1","-lag-in-frames","0","-aom-params","enable-keyframe-filtering=0",
];

/**
 * One frame at a time, through the `avif` muxer, N at once.
 *
 * THE MUXER IS NOT OPTIONAL. `-f image2` will happily write a file that opens
 * in ffmpeg, in an image viewer, and in ffprobe — and that no browser will
 * display, because it writes an EIGHT byte `av1C`: the AV1 configuration box
 * with its configuration record missing. A conformant one is twelve. ffmpeg's
 * own decoder reads the sequence header out of the OBUs and never notices;
 * Chrome and Firefox check the box and refuse the image outright. That single
 * box is why the AVIF tiers went unused from the day they were added — the
 * format probe is itself an AVIF written this way, so it failed too, every
 * visitor fell back to WebP, and the film has been running at the fallback's
 * width ever since.
 *
 * `-f avif` writes the box properly, but only one image per invocation: given
 * `f%04d.avif` it produces a single animated file with a `moov` in it, which
 * is the opposite of what this needs. So the sequence is extracted once to
 * PNG and each frame encoded on its own, `ENC_POOL` at a time.
 *
 * Verify with the box, not with a decoder that tolerates it:
 *   xxd f0001.avif | grep av1C     # the size word before it must be 12
 */
const ENC_POOL = 4;
const ENC_THREADS = 3;

const runFfmpeg = (args) =>
  new Promise((res, rej) => {
    const child = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "inherit"] });
    child.on("error", rej);
    child.on("close", (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`))));
  });

async function pool(items, limit, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    })
  );
}
const webpArgs = ["-c:v","libwebp","-quality",String(quality),"-compression_level","6","-preset","picture"];

/** The AVIF path: one pass to PNG, then one `-f avif` encode per frame. */
async function extractAvif(w, q) {
  const dir = join(outDir, "avif", String(w));
  mkdirSync(dir, { recursive: true });
  const tmp = join(outDir, `.frames-${w}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  const args = ["-v","error","-y"];
  if (start > 0) args.push("-ss", String(start));
  args.push("-i", input);
  if (endArg !== null || span < srcDuration) args.push("-t", String(span));
  args.push("-vf", `${reframe}fps=${effFps},scale=${w}:-2:flags=lanczos`);
  args.push("-f", "image2", join(tmp, `f%0${4}d.png`));

  process.stdout.write(`  … avif ${w}px `);
  const t0 = Date.now();
  execFileSync(FFMPEG, args, { stdio: ["ignore","ignore","inherit"] });

  const frames = readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
  await pool(frames, ENC_POOL, async (name) => {
    const src = join(tmp, name);
    await runFfmpeg([
      "-v","error","-y","-i",src,"-frames:v","1",
      ...avifArgs(q),
      "-f","avif", join(dir, name.replace(/\.png$/, ".avif")),
    ]);
    rmSync(src, { force: true });
  });
  rmSync(tmp, { recursive: true, force: true });

  const files = readdirSync(dir).filter((f) => f.endsWith("avif")).sort();
  const bytes = files.reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  console.log(
    `→ ${files.length} frames, ${(bytes / 1048576).toFixed(1)} MB` +
    ` (${(bytes / files.length / 1024).toFixed(1)} KB/frame, ${((Date.now() - t0) / 1000).toFixed(0)}s)`
  );
  return { width: w, height: heightFor(w), dir: String(w), count: files.length, bytes };
}

const avifSizes = [];
for (const [i, w] of widths.entries()) {
  // The LAST width is the spine, and only the spine gets the harder quality.
  // Every frame in it is on screen for a few milliseconds while the visitor is
  // moving fast, and is replaced by a display tier the moment they slow down,
  // so display-tier bytes are wasted on it.
  //
  // Everything before it is a display tier the component may choose between:
  // a 1,280 to 1,536px laptop at 1x asks for about 1,400 device pixels across,
  // and handing it the 1,920 built for retina costs it a third more bytes for
  // pixels its screen cannot show. `--widths 1920,1400,640` is display, display,
  // spine — widest first, spine last.
  const spine = i === widths.length - 1;
  avifSizes.push(await extractAvif(w, spine ? crf + 10 : crf));
}
const webpSizes = [extract("webp", webpWidth, webpArgs)];

// ---------------------------------------------------------------------------
// Stills and poster

if (stills > 0) {
  const stillDir = resolve("public/media/stills");
  mkdirSync(stillDir, { recursive: true });
  for (const f of readdirSync(stillDir)) if (/^s\d+\.(jpg|webp)$/.test(f)) rmSync(join(stillDir, f));
  /**
   * Which of the stills to actually write, 1-based. Empty means all of them.
   *
   * `--stills` has to stay at the number the SPACING was chosen for, because
   * the still for slot k is pulled from `(k + 0.5) / stills` of the way through
   * the film — lower it to three and you get three different pictures, not the
   * three you had. So the count stays 8 and this says which of the eight are
   * wanted.
   *
   * `src/lib/content/schools.ts` uses s4, s5 and s6. The other five were being
   * written, committed and deployed for nothing.
   */
  const keep = String(opt("stills-keep", "")).split(",").map(Number).filter(Boolean);
  for (let k = 0; k < stills; k++) {
    if (keep.length && !keep.includes(k + 1)) continue;
    const t = start + (span * (k + 0.5)) / stills;
    // WebP, not AVIF: these are section imagery inside next/image on a page
    // that is otherwise entirely WebP, and they are decoded once and held,
    // where AVIF's slower decode is a cost with no matching benefit.
    execFileSync(FFMPEG, ["-v","error","-y","-ss",String(t),"-i",input,"-vframes","1",
      // The still is seeked to directly, so the reframe's `t` is 0 here and
      // its first anchor would win whatever shot the still is from. Anchored
      // by hand instead: `t` is the time within the segment, which is exactly
      // what the expression tests.
      "-vf",`${reframeAt(t - start)}scale=1700:-2:flags=lanczos`,"-c:v","libwebp","-quality","78",
      "-compression_level","6","-preset","picture", join(stillDir, `s${k + 1}.webp`)]);
  }
  console.log(`  … ${stills} stills → public/media/stills`);
}

// The poster is the LCP image and the only thing on screen before a single
// frame has landed, so it stays WebP: universally decodable, no format probe in
// front of it, no chance of it being the one image a browser cannot read.
execFileSync(FFMPEG, ["-v","error","-y","-ss",String(start),"-i",input,"-vframes","1",
  "-vf",`${reframeAt(0)}scale=1400:-2:flags=lanczos`,"-c:v","libwebp","-quality","62",
  "-compression_level","6","-preset","picture", join(outDir,"poster.webp")]);

// ---------------------------------------------------------------------------
// Verify, before the manifest says any of this is usable
//
// Every AVIF defect this build has shipped was SILENT. The frames opened in
// ffmpeg, ffprobe read their dimensions back, and an image viewer showed them;
// only a browser refused, and the component's answer to a browser refusing is
// to fall back to WebP without a word. The site ran at the fallback's width for
// months on end and nothing anywhere said so.
//
// So the build now proves its own output before writing a manifest that claims
// it works. Both checks are cheap and both catch a real regression that has
// already happened once:
//
//   av1C  — `-f image2` writes the AV1 configuration box eight bytes long, with
//           its configuration record missing. Chrome and Firefox reject such a
//           file; ffmpeg does not care. Twelve is the conformant length.
//   decode — without `-g 1` libaom writes inter frames, each a delta against a
//           picture that is not in the file. They parse. They do not decode.
function verifyTier(dir, label) {
  const files = readdirSync(dir).filter((f) => f.endsWith(".avif")).sort();
  if (!files.length) throw new Error(`${label}: no frames written`);

  // Every frame, for the box: reading twelve bytes of header is nearly free.
  for (const f of files) {
    const head = readFileSync(join(dir, f)).subarray(0, 512);
    const at = head.indexOf("av1C");
    if (at < 4) throw new Error(`${label}/${f}: no av1C box — not an AVIF a browser will read`);
    const size = head.readUInt32BE(at - 4);
    if (size < 12) {
      throw new Error(
        `${label}/${f}: av1C is ${size} bytes, needs 12. ` +
        `This is the -f image2 defect: encode through the avif muxer.`
      );
    }
  }

  // A spread of frames, for the pixels. Frame one is always a keyframe even
  // when the rest are not, so checking only the first would have passed every
  // broken build this file has produced.
  const sample = [0, 1, 2, Math.floor(files.length / 3), Math.floor(files.length / 2), files.length - 2, files.length - 1]
    .filter((i, k, a) => i >= 0 && i < files.length && a.indexOf(i) === k);
  for (const i of sample) {
    try {
      execFileSync(FFMPEG, ["-v","error","-i",join(dir, files[i]),"-frames:v","1","-f","null","-"], { stdio: "ignore" });
    } catch {
      throw new Error(
        `${label}/${files[i]}: will not decode. ` +
        `Inter frames written as stills — check -g 1 is on.`
      );
    }
  }
  return { checked: files.length, decoded: sample.length };
}

for (const size of avifSizes) {
  const { checked, decoded } = verifyTier(join(outDir, "avif", size.dir), `avif/${size.dir}`);
  console.log(`  ✓ avif ${size.dir}px — av1C on ${checked} frames, ${decoded} decoded`);
}

// ---------------------------------------------------------------------------
// Manifest

const count = Math.min(...[...avifSizes, ...webpSizes].map((s) => s.count));

// The spine is a stride over the smallest AVIF tier, sized so one pass covers
// the whole film in about ninety frames — enough that every scroll position has
// a real picture within a third of a second of itself, for well under a
// megabyte. Not a separate frame set: same files, read further apart.
const spineStride = Math.max(1, Math.round(count / 90));

const rev = tourRev(outDir);
const manifest = {
  count,
  rev,
  fps: effFps,
  duration: span,
  pad: 4,
  base: `/${outDir.split(/[\\/]/).slice(-3).join("/")}`,
  poster: `/${outDir.split(/[\\/]/).slice(-3).join("/")}/poster.webp?v=${rev}`,
  aspect: srcW / frameH,
  orientation,
  spineStride,
  cuts,
  formats: {
    avif: { ext: "avif", sizes: avifSizes.map(({ width, height, dir }) => ({ width, height, dir })) },
    webp: { ext: "webp", sizes: webpSizes.map(({ width, height, dir }) => ({ width, height, dir })) },
  },
  builtFrom: basename(input),
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

// The component imports the manifest at build time, so keep a copy in src/.
// Named by orientation, because the page ships one film per shape and picks
// between them at mount.
mkdirSync(resolve("src/lib"), { recursive: true });
writeFileSync(resolve(`src/lib/tour-manifest-${orientation}.json`), JSON.stringify(manifest, null, 2));

const total = [...avifSizes, ...webpSizes].reduce((n, s) => n + s.bytes, 0);
const spineBytes = (avifSizes[avifSizes.length - 1].bytes / count) * Math.ceil(count / spineStride);
console.log(`\n✓ ${count} frames, ${(total / 1048576).toFixed(1)} MB on disk`);
console.log(`✓ spine: every ${spineStride}th frame of the ${avifSizes[avifSizes.length - 1].width}px tier`);
console.log(`  = ${Math.ceil(count / spineStride)} frames, ${(spineBytes / 1048576).toFixed(2)} MB for the whole film end to end`);
console.log(`✓ ${cuts.length} cuts, dissolved by the component`);
console.log(`✓ manifest → ${join(outDir, "manifest.json")} and src/lib/tour-manifest-${orientation}.json`);
