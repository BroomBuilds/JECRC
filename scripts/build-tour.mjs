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
 *   --widths <list>  AVIF widths, display first, comma sep  (default 1400,640)
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
 * Measured on this footage, on the densest stretch of the film:
 *
 *   WebP q50 @1100   41.9 KB/frame      <- what the site shipped before
 *   AVIF crf40 @1400  8.9 KB/frame
 *   AVIF crf42 @640   4.2 KB/frame
 *
 * AVIF at full width costs a fifth of WebP at a smaller one. Over a link
 * measured at 5.5 Mbps that is the difference between 16 frames/s delivered
 * and 36 — and a deliberate scroll through the tour needs about 16, while a
 * normal scroll-past needs 66. So the format choice is the single largest
 * lever on whether the film flows for a first-time visitor.
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

import { execFileSync, execSync } from "node:child_process";
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
const avifArgs = (q) => [
  "-c:v","libaom-av1","-crf",String(q),"-cpu-used","6",
  "-row-mt","1","-threads","0","-pix_fmt","yuv420p",
];
const webpArgs = ["-c:v","libwebp","-quality",String(quality),"-compression_level","6","-preset","picture"];

const avifSizes = [];
widths.forEach((w, i) => {
  // The spine tier is transient by design — every frame in it is on screen for
  // a few milliseconds while the visitor is moving fast, and will be replaced
  // by the display tier the moment they slow down. Spending display-tier bytes
  // on it buys nothing, so it is encoded appreciably harder.
  avifSizes.push(extract("avif", w, avifArgs(i === 0 ? crf : crf + 10)));
});
const webpSizes = [extract("webp", webpWidth, webpArgs)];

// ---------------------------------------------------------------------------
// Stills and poster

if (stills > 0) {
  const stillDir = resolve("public/media/stills");
  mkdirSync(stillDir, { recursive: true });
  for (const f of readdirSync(stillDir)) if (/^s\d+\.(jpg|webp)$/.test(f)) rmSync(join(stillDir, f));
  for (let k = 0; k < stills; k++) {
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
