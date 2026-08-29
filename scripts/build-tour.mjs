#!/usr/bin/env node
/**
 * build-tour.mjs: turn any video into the scroll-driven tour.
 *
 *   node scripts/build-tour.mjs <video> [options]
 *
 * Options
 *   --fps <n>        frames extracted per second of video   (default 10)
 *   --start <sec>    trim from                              (default 0)
 *   --end <sec>      trim to                                (default end of file)
 *   --widths <list>  output widths, comma separated         (default 1600,900)
 *   --quality <n>    WebP quality 0-100                     (default 58)
 *   --format <fmt>   webp | jpg                             (default webp)
 *   --max <n>        hard cap on frame count                (default 400)
 *   --out <dir>      output dir  (default public/media/tour)
 *
 * Writes:
 *   public/media/tour/<width>/f0001.webp …
 *   public/media/tour/poster.jpg
 *   public/media/tour/manifest.json    <- the component reads only this
 *
 * Requires ffmpeg on PATH.
 */

import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith("--")) {
  console.error("usage: node scripts/build-tour.mjs <video> [--fps 10] [--start 0] [--end 30] [--widths 1600,900]");
  process.exit(1);
}

const input = resolve(argv[0]);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const fps      = Number(opt("fps", 10));
const start    = Number(opt("start", 0));
const endArg   = opt("end", null);
const widths   = String(opt("widths", "1600,900")).split(",").map((n) => parseInt(n, 10));
const quality  = Number(opt("quality", 58));
const format   = String(opt("format", "webp"));
const maxFrames= Number(opt("max", 400));
const outDir   = resolve(opt("out", "public/media/tour"));

if (!existsSync(input)) {
  console.error(`✗ no such file: ${input}`);
  process.exit(1);
}
try { execSync("ffmpeg -version", { stdio: "ignore" }); }
catch { console.error("✗ ffmpeg not found on PATH. Install it and try again."); process.exit(1); }

const probe = (stream) =>
  execFileSync("ffprobe", ["-v","error","-select_streams","v:0","-show_entries",stream,"-of","csv=p=0",input])
    .toString().trim().split(/[\n,]/)[0];

const srcDuration = Number(
  execFileSync("ffprobe", ["-v","error","-show_entries","format=duration","-of","csv=p=0",input]).toString().trim()
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

console.log(`→ source   ${srcW}×${srcH}, ${srcDuration.toFixed(2)}s`);
console.log(`→ segment  ${start}s … ${end.toFixed(2)}s  (${span.toFixed(2)}s)`);
console.log(`→ sampling ${effFps} fps  ≈ ${Math.round(span * effFps)} frames per size`);

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

const sizes = [];
for (const w of widths) {
  const h = Math.round((w * srcH) / srcW / 2) * 2;
  const dir = join(outDir, String(w));
  mkdirSync(dir, { recursive: true });

  const args = ["-v","error","-y"];
  if (start > 0) args.push("-ss", String(start));
  args.push("-i", input);
  if (endArg !== null || span < srcDuration) args.push("-t", String(span));
  args.push("-vf", `fps=${effFps},scale=${w}:-2`);
  if (format === "webp") args.push("-c:v","libwebp","-quality",String(quality),"-compression_level","5","-preset","picture");
  else args.push("-q:v", String(Math.max(2, Math.round((100 - quality) / 8))));
  args.push(join(dir, `f%04d.${format}`));

  process.stdout.write(`  … extracting ${w}px `);
  execFileSync("ffmpeg", args, { stdio: ["ignore","ignore","inherit"] });

  const files = readdirSync(dir).filter((f) => f.endsWith(format)).sort();
  const bytes = files.reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  console.log(`→ ${files.length} frames, ${(bytes / 1048576).toFixed(1)} MB`);
  sizes.push({ width: w, height: h, dir: String(w), count: files.length, bytes });
}

// Stills pulled from the same film, used as section imagery elsewhere on the
// page so the whole site is dressed from one source. --stills 0 to skip.
const stills = Number(opt("stills", 8));
if (stills > 0) {
  const stillDir = resolve("public/media/stills");
  mkdirSync(stillDir, { recursive: true });
  for (const f of readdirSync(stillDir)) if (/^s\d+\.jpg$/.test(f)) rmSync(join(stillDir, f));
  for (let k = 0; k < stills; k++) {
    const t = start + (span * (k + 0.5)) / stills;
    execFileSync("ffmpeg", ["-v","error","-y","-ss",String(t),"-i",input,"-vframes","1",
      "-vf","scale=1700:-2","-q:v","3", join(stillDir, `s${k + 1}.jpg`)]);
  }
  console.log(`  … ${stills} stills → public/media/stills`);
}

// poster = first frame, used before anything has loaded
execFileSync("ffmpeg", ["-v","error","-y","-ss",String(start),"-i",input,"-vframes","1","-q:v","3",join(outDir,"poster.jpg")]);

const count = Math.min(...sizes.map((s) => s.count));
const manifest = {
  count,
  fps: effFps,
  duration: span,
  format,
  pad: 4,
  base: "/media/tour",
  poster: "/media/tour/poster.jpg",
  aspect: srcW / srcH,
  sizes: sizes.map(({ width, height, dir }) => ({ width, height, dir })),
  builtFrom: input.split("/").pop(),
};
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
// The component imports the manifest at build time, so keep a copy in src/.
mkdirSync(resolve("src/lib"), { recursive: true });
writeFileSync(resolve("src/lib/tour-manifest.json"), JSON.stringify(manifest, null, 2));

const total = sizes.reduce((n, s) => n + s.bytes, 0);
console.log(`\n✓ ${count} frames × ${sizes.length} sizes, ${(total / 1048576).toFixed(1)} MB total`);
console.log(`✓ manifest written to ${join(outDir, "manifest.json")}`);
console.log(`\n  Scroll length is set by TOUR_VH in src/components/ScrollTour.tsx.`);
console.log(`  ${count} frames over the current 900vh ≈ one new frame every ${Math.round(900 * 8 / count)}px of scroll.`);
