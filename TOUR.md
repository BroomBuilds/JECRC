# How the scroll tour works

Everything, from the top.

---

## 1. The idea

A normal hero video plays on a clock. This one plays on your scroll wheel: scroll position
maps 1:1 onto a position in the film. Scroll down and you move forward through it; scroll up
and you rewind. Stop and it stops. The film never plays by itself.

That's the whole illusion. The rest is about making it feel like film rather than a
flip-book, in both directions.

---

## 2. Two ways to build it, and why this one

### Approach A: scrub a `<video>` with `currentTime`

The obvious one, and what the Royal Palace site does:

```js
video.currentTime = progress * video.duration;
```

It works. It is also **asymmetric**, and that asymmetry is exactly what you feel as jank.

H.264 and VP9 store a keyframe (a whole picture) every so often, and then a run of
*delta* frames that only describe what changed since the previous frame. To display frame
N the decoder must start at the last keyframe at or before N and decode forward.

- **Scrolling down** you ask for frame N, then N+1, then N+2. The decoder is already sitting
  on N; each step is one frame of work.
- **Scrolling up** you ask for N, then N−1, then N−2. The decoder cannot run backwards. For
  every single step it seeks back to the previous keyframe and decodes forward again.

With a keyframe every 12 frames, going up costs on average ~6× more decode work per step
than going down, and it is bursty, because the cost spikes at every keyframe boundary.
That is precisely the "fine going down, not smooth at all going up" report.

You can soften it (short GOP, all-intra encoding, easing the playhead), and the Royal Palace
build does all three. You cannot remove it, because the browser still runs a demux → decode →
paint cycle for every seek, and Safari in particular serialises them.

### Approach B: an image sequence on a canvas, **what this site does**

Explode the film into individual stills at build time. Preload them. On scroll, pick the
frame and `drawImage` it.

- No keyframes, so no direction-dependent cost.
- No decoder state, so no seek pipeline.
- Frame N costs exactly the same whether you arrived from N−1 or N+1.

The price is bytes and requests: 240 stills instead of one file. That is the trade, and for a
hero whose whole job is to be scrubbed, it is worth it.

**Measured on this machine** (headless Chromium, 1280×800, 130 real wheel events each way,
recording `requestAnimationFrame` deltas):

| | scrolling down | scrolling up |
|---|---|---|
| Royal Palace, video `currentTime` scrub | p95 **50.0 ms**, 155 frames over 32 ms | p95 **33.4 ms**, 124 frames over 32 ms |
| JECRC, canvas image sequence | p95 **16.8 ms**, 20 frames over 32 ms | p95 **16.8 ms**, 3 frames over 32 ms |

60 fps is a 16.7 ms budget. The video version misses it on most frames going up; the canvas
version essentially never does, in either direction.

---

## 3. The build step

`scripts/build-tour.mjs` wraps ffmpeg. It is run once per orientation — the page ships one
film per shape, the same edit at two aspects, and a device only ever fetches one of them:

```
npm run tour        # both, with the parameters that shipped

ref/website-horizontal.mp4 ─> public/media/tour/h/avif/1400/f0001.avif … f0734.avif
                          └─> public/media/tour/h/avif/640/…            (the spine)
                          └─> public/media/tour/h/webp/1100/…           (fallback)
                          └─> public/media/tour/h/poster.webp
                          └─> public/media/tour/h/manifest.json  (+ src/lib/tour-manifest-landscape.json)

ref/website-vertical_1.mp4 ─> public/media/tour/v/avif/720/…  640/…  webp/640/…
```

### Format: AVIF, with WebP behind it

The single largest decision here. Measured on this footage, on its densest stretch:

| | bytes/frame |
|---|---|
| WebP q50 @1100 (what the site shipped before) | 55.1 KB |
| **AVIF crf36 @1400** | **8.9 KB** |
| AVIF crf46 @640 (the spine) | 1.7 KB |

AVIF at a *larger* size costs a sixth of WebP. Over a link measured at 5.5 Mbps to the
Singapore edge that is the difference between 16 frames a second delivered and 36 — against
16 needed for a deliberate scroll and 66 for a normal scroll-past. Format is most of the
answer to whether the film flows on a first visit.

Browsers without AVIF get a WebP tier built at the width the site shipped before, so they are
never worse off than they were; they simply do not get the improvement. `ScrollTour` probes
support once, at module scope, with a 2×2 AVIF data URI.

AVIF encodes at ~0.15 s/frame at `-cpu-used 6`, so a full two-orientation build is about five
minutes. It also decodes slower than WebP, which is why decoding stays off the paint path
(see 4c) and matters most on cheap Android — **the one number here not yet measured on real
low-end hardware.**

### Cut detection

The build finds the film's hard cuts and writes them into the manifest as `cuts`, because a
scroll-scrubbed montage cannot flow and the component has to dissolve across them (see 4g).

Mean luma difference between consecutive source frames: normal motion in this footage sits
around 4 on a 0-255 scale, a cut lands at 40-70. A bare threshold is not enough — this film
contains a fast dolly through foreground trees that holds ~23 for forty-seven consecutive
frames, far above any sane threshold and not a cut at all. A cut is an **isolated spike**;
sustained motion is a **plateau**. So each candidate is measured against a baseline taken
from each side separately, and the *smaller* of the two decides: a cut stands clear of at
least one of the shots it joins, a plateau stands clear of neither.

The logic lives in `scripts/find-cuts.mjs` with its checks attached — `npm run tour:cuts`.
Re-tune it without a five-minute re-encode using `--cuts-only`, which re-detects against an
existing build and rewrites only the cut list, leaving the frames and therefore the rev alone.

Both cuts of the current film run 29.36 s and cut at the same eleven fractions:

```
.109 .168 .225 .305 .395 .459 .523 .607 .711 .783 .867
```

### Choosing `--fps`

Think in **pixels of scroll per frame**, not frames per second: nothing here runs on a clock.

```
frames  =  duration × fps
pixels per frame  =  (TOUR_VH / 100 × viewport height) / frames
```

The landscape film is `--fps 25` against a 25 fps source: 734 frames, and at `--tour-vh: 1500`
on a 900 px window that is 18 px of scroll per frame. The portrait film is `--fps 15` against
a 30 fps source: 441 frames at `--tour-vh: 900`, or 18 px per frame as well.

**Keep `--fps` an integer divisor of the source rate.** A non-divisor makes ffmpeg pick the
nearest source frame for each output slot, so the *content* intervals come out uneven while
the scroll mapping stays uniform — judder no easing can fix. This is also why the runtime no
longer takes every second frame on phones: the portrait film is built at the density a phone
should have, so the sequence a device fetches is decided once at build time instead of being
resampled again at runtime.

---

## 4. The runtime

`src/components/sections/ScrollTour.tsx`. Four parts.

### 4a. Picking a film, a format and a size

Three choices, all made once at mount and never revisited:

```js
const m      = matchMedia("(orientation: portrait)").matches ? portraitFilm : landscapeFilm;
const fmt    = (await AVIF_OK) ? m.formats.avif : m.formats.webp;
const dpr    = Math.min(devicePixelRatio, 1.75);
const chosen = fmt.sizes.find(s => s.width >= innerWidth * dpr * 0.85) ?? largest;
```

Orientation is decided here rather than in CSS so a phone never touches the landscape frames
at all. The poster is the exception: it has to exist in the markup before any script runs, so
it is a `<picture>` with a `media` condition and a matching pair of `<link rel="preload"
media>` in `layout.tsx` — the browser evaluates those before it makes any request, so exactly
one poster is ever fetched and it is never fetched twice.

DPR is capped at 1.75: a 3x retina phone does not need a 4,000 px source for a full-bleed
soft-focus film, and the memory saved matters more than the sharpness lost.

### 4b. Coarse-to-fine, inside the spine

Naively loading `f0001 … f0240` in order means the first seconds are pristine while the end of
the tour is still blank, and a visitor who flicks to the bottom sees nothing. So the spine
itself is ordered in passes of decreasing stride:

```js
for (const stride of [8, 4, 2, 1])
  for (let k = 0; k < marks.length; k += stride)
    if (!queued(marks[k])) spinePlan.push(marks[k]);
```

Pass one covers the entire timeline in about a dozen frames. The component reveals as soon as
a quarter of the spine has landed, because the spine spans the film end to end and a quarter
of it already puts a real picture near wherever the visitor is.

### 4c. Decoding off the paint path

```js
img.onload = () => {
  if (img.decode) img.decode().then(settle, settle);
  else settle();
};
```

`onload` only means the bytes arrived. The first `drawImage` of an undecoded image decodes it
**synchronously, inside your rAF callback**, a 5 to 15 ms stall right when you are trying to
hold 16.7 ms. Calling `img.decode()` first moves that work off the critical path and marks
the frame ready only once it can be painted for free.

This one change took the downward pass from 103 dropped frames to 20, and the upward pass
from 12 to 3.

### 4d. Reading progress, and the thing not to do

```js
const rect = section.getBoundingClientRect();
const p = clamp01(-rect.top / (rect.height - innerHeight));
const idx = Math.round(p * (count - 1));
if (idx !== lastDrawn) paint(idx);
```

Read straight off the layout box, every frame, inside a `requestAnimationFrame` loop that
only runs while the section is on screen (an `IntersectionObserver` starts and stops it).

**No easing. No scrub. No lerp toward a target.** This is the second half of the Royal Palace
fix. That build had Lenis smoothing the scroll position, GSAP `scrub` smoothing it again, and
then a lerp easing `currentTime` toward the scrubbed value: three filters in series. Each is
defensible alone; stacked, they put visible latency between your fingers and the picture, and
latency reads as lag most strongly when you reverse direction, because every filter has to
unwind before the image turns around.

Here Lenis smooths the scroll position once and nothing touches it again. One scroll position
always maps to exactly one frame index, which is why scrolling up is bit-for-bit the reverse
of scrolling down, verified by hashing the canvas at 25 positions on the way down and again
on the way up: **25/25 identical**.

### 4e. What gets fetched, and when

Three phases, in strict priority order. Only the first is unconditional:

| phase | what | when |
|---|---|---|
| SPINE | every `spineStride`th frame of the **smallest** tier, coarse-to-fine | immediately |
| FILL | the frames between, same small tier, in a window that travels with the playhead, **strided by velocity** | first scroll, wheel, key or touch |
| UPGRADE | the display tier near the playhead, only while the visitor is moving slowly | same gesture |

The spine is the change that matters most for a first visit. It is not a separate frame set —
it is the same small tier read further apart — and it covers the film **end to end** for
about **150 KB**, less than the poster costs. Before, the priming pass spent 0.90 MB to reach
26 frames at display width; resolution is worthless on a frame that is on screen for
milliseconds while someone is scrolling, and temporal coverage is everything.

### The velocity stride

The fix for the fault that started all of this. Density that cannot arrive in time is not
merely wasted, it is actively harmful: it fills the connection with frames the playhead has
already passed, so the frames *under* the playhead queue behind them and the film appears to
freeze and then snap. Scrolling back up and down again felt fine only because everything was
cached by then.

Fast scrolling wants frames **sparse and far**. Slow scrolling wants them **dense and near**.
Same budget, opposite shape — and the old loader could not tell the two apart, because it had
no idea how fast anyone was moving.

So the stride is a ratio of two rates, both **measured live** rather than assumed:

```js
passRate = |vel| × count × 60          // frames of film going by, per second
rate                                    // frames actually being delivered, per second (EMA)
stride   = clamp(ceil(passRate / rate), 1, 8)
```

Neither is guessable — a 5 Mbps link in Jaipur reaching a Singapore edge is not the link this
was written on — so both are watched and the stride follows them.

Requests the playhead has left behind are **cancelled**, which the old loader never did. A
frame is marked asked-for and then abandoned; without the cancel, sixteen in-flight requests
for two-second-old frames sit in front of the ones actually needed.

### 4f. Never a blank frame, and never a hard wrong one

Four fallbacks stack up:

1. The poster `<img>` sits OVER the canvas and fades out once there are real frames. Not under
   it: the 2D context is requested with `alpha: false` for draw speed, and an opaque canvas is
   **black** until something is drawn into it, so underneath the poster it covered the poster
   completely. That cost 3.7 s of LCP render delay on a throttled phone before it was caught.
2. `nearest(i)` walks outward from the requested index to the closest frame that *is* loaded,
   so a half-loaded tour shows the nearest real picture rather than nothing.
3. **The canvas blurs by how far off that frame is.** `nearest` reports the distance it had to
   walk and the paint turns it into `blur(min(d/8, 3)px)` as a CSS filter on the element — the
   compositor does it for free, where `ctx.filter` would be a per-pixel pass every paint. A
   film still arriving now goes soft rather than jumping, which reads as something the page is
   doing rather than something wrong with it. `REACH` is also tied to the spine stride instead
   of a flat 64, so the canvas can no longer show a picture two and a half seconds of film away
   from the one asked for and paint it as if it were correct.
4. Under `prefers-reduced-motion: reduce` the whole loop is skipped: one frame is loaded,
   painted once, and the opening caption is shown.

### 4g. The cuts

The film is a montage — eleven hard cuts in thirty seconds. Played at 25 fps a cut passes in
40 ms and the eye reads it as film grammar. **Under a scrub the visitor sets the timing**, so
the same cut becomes one picture replaced by an unrelated picture at whatever speed a thumb
chose, with no motion carrying the eye across it. It reads as breakage, and eleven of them
read as a broken page. No amount of loading work touches this: it is the material, not the
network.

So a cut is never painted as a cut. Across a short span either side of one, the two shots are
cross-dissolved and the canvas blurs up to a peak at the midpoint and back down. A dissolve is
legible at *any* scrub speed because it is a transition rather than the absence of one, and
the blur is what stops it reading as two overlapping pictures instead of one movement.

The frames blended are **pinned** — the outgoing shot's last frame under the incoming shot's
first — so the dissolve is a pure function of scroll position and unwinds exactly on the way
back up, which is the property 4d is built on.

The real fix is upstream: a scroll-scrub wants one continuous camera move, and thirty seconds
delivered as a single drone move would make all of this unnecessary.

---

## 5. The captions

Same progress value, different consumer. Each caption declares the window it lives in:

```ts
{ at: [0.23, 0.42], eyebrow: "The campus", title: "Everything here is a workshop" }
```

and gets opacity from a pair of ramps: in over the first 4.5% of its window, out over the
last 4.5%:

```js
const fadeIn  = a <= 0 ? 1 : smooth(p, a, a + 0.045);
const fadeOut = 1 - smooth(p, b - 0.045, b);
el.style.opacity = Math.min(fadeIn, fadeOut);
```

Written straight to `style` rather than through React state, because this runs every frame and
a `setState` per frame would be 60 renders a second for no reason. React owns the markup; the
loop owns the two properties that change.

A caption anchored at `0` skips its fade-in, otherwise the top of the page would load with an
invisible headline.

---

## 6. Costs, honestly

- **Weight.** 52 MB on disk for the landscape film, 21 MB for the portrait one, 3,529 files.
  A visitor fetches **one** film, in **one** format, mostly at **one** tier: the AVIF ladder
  is 6.4 MB + 1.2 MB landscape, 2.2 MB + 0.7 MB portrait. The rest is the WebP fallback tier,
  which is 39.5 MB of the landscape total and is read by a few percent of browsers.
  **If that disk cost ever matters more than those browsers do, halve the WebP tier's frame
  count rather than its width** — sharpness is what those visitors would notice.
- **Requests.** ~730 per film per tier, but only the ones scrolled past, and the spine is 92
  of them. Fine over HTTP/2.
- **Memory.** A few hundred decoded bitmaps is real memory pressure. This is why frames are
  `HTMLImageElement` and not `ImageBitmap`: a bitmap pins decoded pixels until something calls
  `close()`, 4.4 MB a frame at 1400×788, where an `<img>` lets the browser discard and
  re-decode under pressure. The DPR cap and the tier ladder do the rest.
- **AVIF decode.** Slower than WebP, worst on the cheap Android hardware the byte savings help
  most. Decoding is off the paint path (4c), but **this has not been measured on real low-end
  hardware** and it is the one number in this document that is still a guess.
- **Not free on first load.** There is still a loading state, shown as a percentage — but it
  now tracks a 150 KB spine rather than a 900 KB priming pass, so it is rarely on screen long.

---

## 7. The cache header that undid all of it

Worth its own section, because it was live for months and defeated everything above.

`public/_headers` and the `headers()` block in `next.config.ts` both used to say that where
two rules match one request, **the later one wins**. Neither platform works that way. Both
**append**, so every frame came back as:

```
cache-control: public, max-age=0, must-revalidate, public, max-age=2592000,
               public, max-age=31536000, immutable
```

Browsers reading a duplicated `max-age` take the **first**. Every frame of the film was
therefore revalidated on every single visit — ~800 conditional requests at ~400 ms each,
sixteen in flight, twenty seconds of pure round trips for a visitor whose disk already held
the entire film. `/_next/static/*` was dragged down with it.

The fix is not ordering. It is writing `Cache-Control` **exactly once** per request: the
catch-all carries security headers and no `Cache-Control` at all, and every path that needs
one names it itself, with no two rules overlapping. Two matching traps caused the original
bug and will cause it again:

- `*` is greedy **across path segments**, so `/media/*` matches `/media/tour/h/avif/…` and
  `/*.png` matches `/brand/crest.png`.
- `:name` matches **exactly one** segment, which is why the loose files in `/media` are
  covered by `/media/:file` and the film underneath is not.

Verify after any change to either file — one `max-age` per response, no more:

```bash
curl -sI https://<host>/media/tour/h/avif/1400/f0400.avif?v=<rev> | grep -i cache
curl -sI https://<host>/media/school-computing.webp             | grep -i cache
```
