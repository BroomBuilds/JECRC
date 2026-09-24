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

## 2b. Two video engines, both built, both rejected

Section 2 is right about `<video>`. The conclusion it drew — that the image sequence is the
answer — survived two serious attempts to beat it, and the attempts are worth recording so
nobody spends the time again.

The complaint that started them was real: to keep 503 frames x 3 tiers inside a sane
download the display tier was **1400px at crf 36**, drawn 1600px wide, and an enlarged
compressed frame is soft. "The video quality is lost." True — but it was never the engine's
fault, which took two builds to establish.

### Attempt 1: a `<video>` scrubbed with `currentTime`

Shipped for review, reported as "quite choppy". Measured on the built page under a real
wheel scroll, counting **distinct pictures presented** via `requestVideoFrameCallback`:

| | median gap | p95 | worst |
|---|---|---|---|
| down | 27.8 ms | 69.5 ms | 166.7 ms |
| up | 27.8 ms | 62.5 ms | 187.5 ms |

Symmetric, so the 0.4s GOP did its job — this is not the asymmetry section 2 describes. It
is the floor: **one seek per picture**, ~20 ms alone, ~28 ms beside the page's own work.
Shortening the GOP cannot help, because forward and backward seeks already cost the same.

### Attempt 2: WebCodecs, no seeking at all

`VideoDecoder` skips the seek entirely — **4.4 ms a frame**, software, no GPU — so a whole
12-frame group costs about what one `<video>` seek did. Decode a group, keep it as
`ImageBitmap`s, and scrubbing inside it is free. Three things had to be right:

- **Nothing may be awaited.** Awaiting each group measured p50 **0 ms** / p95 **128 ms**:
  free inside a group, a stall at every boundary. Groups had to be requested a group AHEAD
  in the direction of travel, with the loop never blocking.
- **The decoder's output pool is small.** Chrome silently stops when its output frames are
  all still open — 10 frames of 12, queue drained, `flush()` never settles. Frames must be
  released inside the output callback, which rules out `createImageBitmap` (a promise; that
  path failed with "Decoding error"). `OffscreenCanvas.transferToImageBitmap()` is
  synchronous and works.
- **mp4box recycles its sample buffers.** Chunks have to be copied out or they decode to
  nothing — same wedge, different cause.

It got there, and it still lost:

| | frames, crf 30 | `<video>` | WebCodecs |
|---|---|---|---|
| down p95 | **36.6 ms** | 69.5 ms | 45.6 ms |
| up p95 | **30.0 ms** | 62.5 ms | 42.3 ms |
| desktop bytes | 38.7 MB | 32 MB | 32 MB |
| SSIM at drawn size | 0.9811 | — | 0.9824 |
| phones | yes | yes | no — 100 MB a group, decoder died at load #60 |
| browsers | all | all | Chrome 94+, Safari 16.4+, Firefox 130+ |

Reported as choppy again, and removed. **A decode has to happen somewhere, and the sequence
has already done it at build time.** That is the whole of it.

### The finding that actually mattered

Both deliveries, same 14 frames, decoded and scaled to the 1600x900 a 1440-wide window
paints, SSIM against the master at that size:

| | total MB | SSIM |
|---|---|---|
| AVIF sequence crf 36 (what shipped) | 21.0 | 0.9717 |
| AVIF sequence crf 32 | 27.4 | 0.9780 |
| **AVIF sequence crf 30 (ships now)** | **31.7** | **0.9811** |
| H.264 crf 20, GOP 12 | 31.8 | 0.9824 |
| AVIF sequence crf 28 | 35.3 | 0.9832 |
| AVIF sequence crf 26 | 39.6 | 0.9851 |
| H.264 crf 17, GOP 12 | 45.7 | 0.9873 |

**The two formats sit on the same quality-per-byte curve.** Video is not a route to a
sharper film — the film is a fast-cut montage with a short GOP, so inter-frame prediction
buys almost nothing against AV1 intra coding. Anyone reaching for video to fix sharpness
should spend the bytes on the sequence instead and skip the two weeks.

### So where the quality actually came from

Two changes, neither of them an engine:

- **`TIER_SLACK` 0.85 → 0.97.** The film is drawn to COVER, so a 1440x900 window asks for
  `max(1440, 900 x 16/9)` = 1600px. The old slack accepted anything within 15% of that, took
  the **1400** tier, and let the browser enlarge a crf-36 AVIF by fourteen percent.
  Upscaling compressed frames is where artefacts stop being subtle. The 1920 tier it skipped
  was already built and already served.
- **`--crf 36 → 30`** landscape, **32 → 28** portrait.

Together: SSIM 0.9717 → 0.9811, past what the crf-20 video managed per byte.

### The first visit was soft, and it was an ordering bug

Reported as: "blurry while I keep scrolling; wait a minute or reload and it's sharp."

That is not a decode problem or a compression problem. `pick()` ran the spine SWEEP — the
**whole** small tier, all 503 frames — before it requested a single display frame. Every one
of those is 640px enlarged to fill a 1600px draw, two and a half times up. Reloading looked
like a cure only because the spine was already cached.

The sweep is coarse-to-fine, so the film is covered end to end after `SPINE_COUNT` frames —
the manifest's own definition, every `spineStride`th frame, 84 of 503, about 800 KB.
Everything after that is closing gaps of a few frames, and at 25 fps a one-frame
substitution is invisible while a 2.5x upscale is not. So the order is now: cover the film,
sharpen what the visitor is looking at, THEN finish the spine, then sharpen the rest.

Nothing can be left blank by this. URGENT still outranks everything and still guarantees a
frame at or just ahead of the playhead at some tier.

Measured on a cold cache at 12 Mbps / 40 ms, scrolling steadily from load:

| | sweep first (before) | coverage first (now) |
|---|---|---|
| first sharp frame | t+6.4s, after 494 spine frames | **t+1.8s, after 90** |
| sharp frames by t+5s | **0** | **69** |
| by t+10s | 100 | 181 |
| by t+20s | 284 | 347 |

The first five seconds — a visitor landing and starting to scroll, which is the only part of
this anyone experiences — went from zero sharp frames to sixty-nine.

What is left is the ~1.8s before coverage completes, which is genuinely the 640px spine. The
dial for that is the last entry in `--widths`: a wider spine is sharper sooner and costs
bytes on the critical path, which is the one place in this loader where bytes are expensive.

### Knobs that are NOT worth turning

- **Encoder effort.** `-cpu-used` 6 → 4 buys **+0.0007 SSIM** and 0.6% fewer bytes for 2.6x
  the encode time; 6 → 3 is +0.0008 for 3.5x. libaom is already near its ceiling on stills.
  Leave it at 6.
- **Resolution.** 1920 is the master's own width. A 2x display is upscaling whatever is
  served; there is nothing above the source to reach for.
- **Lower crf still.** crf 28 and 26 are on the table (35.3 MB, 39.6 MB) and they do look
  better. It is straight bytes, and bigger AVIF frames also cost more to decode during a
  scroll. `--crf` in `tour:h` is the dial.

---

## 3. The build step

`scripts/build-tour.mjs` wraps ffmpeg. It is run once per orientation — the page ships one
film per shape, the same edit at two aspects, and a device only ever fetches one of them:

```
npm run tour        # both, with the parameters that shipped

ref/"website update horizontal.mp4" ─> public/media/tour/h/avif/1400/f0001.avif … f0503.avif
                          └─> public/media/tour/h/avif/640/…            (the spine)
                          └─> public/media/tour/h/webp/1100/…           (fallback)
                          └─> public/media/tour/h/poster.webp
                          └─> public/media/tour/h/manifest.json  (+ src/lib/tour-manifest-landscape.json)

ref/"website update vertical.mp4"   ─> public/media/tour/v/avif/720/…  400/…  webp/640/…
```

### Format: AVIF, with WebP behind it

The single largest decision here. Measured on this footage, all-intra:

| | bytes/frame |
|---|---|
| WebP q50 @1100 (the fallback tier) | 33.7 KB |
| **AVIF crf36 @1920** (the display tier, native width) | **33.5 KB** |
| AVIF crf36 @1400 | 22.2 KB |
| AVIF crf46 @640 (the spine) | 2.5 KB |

So AVIF buys about a third off WebP at the same width — or, as it ships, the SAME bytes at
the source's full 1920. The film is drawn to *cover* the stage, so a 1440×900 window at 2x
asks for about 2,800 device pixels across; anything narrower than the source is enlarged
before it is ever seen, which is what the old 1400 tier was doing.

Browsers without AVIF get the WebP tier, so they are never worse off; they simply do not get
the improvement. `ScrollTour` probes support once, at module scope, with a 2×2 AVIF data URI.

**The numbers in this table used to read 8.9 KB at 1400 and "a sixth of WebP", and the AVIF
tiers had never been fetched by anybody.** Two defects, both silent:

- `-f image2` writes an eight-byte `av1C` — the AV1 configuration box with its configuration
  record missing. ffmpeg reads such a file back without complaint; Chrome and Firefox refuse
  it. Every frame, and the probe blob itself, was written that way, so the probe answered NO
  everywhere and every visitor took the WebP fallback. The build now encodes one frame at a
  time through the `avif` muxer, which writes the box properly.
- Without `-g 1` libaom did what a video encoder does: one keyframe and 502 inter frames,
  each sealed in its own file with nothing to reference. A 1400×788 "still" of 288 bytes is
  the tell. That is where 8.9 KB/frame came from.

Check the box, not a decoder that tolerates it: `xxd f0001.avif | grep av1C`, and the size
word before it must read 12.

All-intra costs more to encode — about 0.5 s/frame at 1920, four at a time, so a full
two-orientation build is roughly six minutes. AVIF also decodes slower than WebP, which is
why decoding stays off the paint path (see 4c) and matters most on cheap Android — **the one
number here not yet measured on real low-end hardware.**

### What the build refuses to ship

Every AVIF defect this project has had was silent: the frames opened in ffmpeg, ffprobe read
their dimensions, an image viewer showed them, and only a browser refused — whereupon the
component fell back to WebP without a word. So `build-tour.mjs` now proves its own output
before it writes a manifest claiming the tiers work. Both checks fail the build loudly, and
both have been tested against the defect they exist for:

| check | catches | how it was verified |
|---|---|---|
| `av1C` box is 12 bytes, every frame | `-f image2`, which writes it 8 bytes long with the codec configuration record missing | a tier built through image2 — build stops on frame 1 |
| a spread of frames really decodes | inter frames written as stills, i.e. `-g 1` missing | a tier built without `-g 1` — build stops on frame 2 |

The decode check samples the first three frames, a third of the way in, the middle and the last
two. It deliberately does not check only frame one: frame one is a keyframe even in a broken
build, which is exactly how the inter-frame defect survived.

Neither check is a substitute for opening the thing in a browser, and the box check is the one
to run by hand after touching the encoder:

```
xxd public/media/tour/h/avif/1920/f0100.avif | grep av1C   # size word before it must be 12
```

### Tiers, and who gets which

Three AVIF widths landscape, two portrait, chosen by the width the film is actually DRAWN at —
which is not the viewport width, because the film covers the stage and overflows the narrow
axis. A 1440×900 window at 2x asks for about 2,800 device pixels across; a 393pt phone asks for
about 1,180.

| screen | tier | a full pass |
|---|---|---|
| 1280–1536 wide at 1x | 1400 | 16.8 MB |
| 1920 at 1x, or 1440 at 2x | 1920 | 19.5–21.3 MB |
| any phone, any tablet in portrait | 1080 | 10.3 MB |

The 1400 tier exists for the laptop sizes. They were being handed the 1920 built for retina and
paying a third more bytes for pixels their screens cannot resolve.

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

Height alone is not enough either, in the other direction. The current portrait cut joins two
sunset aerials of near-identical brightness and that cut measures **21**, under the absolute
floor of 25 — so the landscape cut of the *same edit* was found at 41 and the portrait one was
not, and the portrait film shipped a hard swap where every other cut dissolved. A cut between
two similar pictures is quiet but still *isolated*, so there are two ways in: above 25 the
usual ratio of 3 decides, and between 15 and 25 the frame has to stand **6×** clear of its
neighbourhood instead. The edge of a plateau cannot: entering a sustained high-motion run the
outgoing side is quiet, which clears 3 comfortably and 6 not at all.

The logic lives in `scripts/find-cuts.mjs` with its checks attached — `npm run tour:cuts`.
Re-tune it without a five-minute re-encode using `--cuts-only`, which re-detects against an
existing build and rewrites only the cut list, leaving the frames and therefore the rev alone.

Both cuts of the current film run 20.12 s and cut at the same four fractions, within .0032:

```
landscape   .229 .521 .698 .897
portrait    .232 .521 .699 .897
```

### Reframing the portrait cut

The portrait film is the landscape edit re-framed to 9:16, and re-framing a drone shot that
way puts the horizon near the middle. On a phone the source is *taller* than the viewport, so
the cover fit uses all of its height and trims the sides — which means every pixel of that sky
is on screen, and the campus the shot is of ends up in the bottom third, under the caption.
On the Jaipur beat the entire band above the caption was sky.

So the build can re-frame: `--keep` is the fraction of source height kept, `--anchor` says
where that window sits, one value per shot from 0 (top) to 1 (bottom). The shipped portrait
build is `--keep 0.70 --anchor 1,1,0.35,0.55,0.75`:

| shot | anchor | what it drops |
|---|---|---|
| the opening aerial | 1 | sky |
| the Jaipur campus | 1 | sky |
| the gate | 0.35 | foreground pavement |
| the Block-2A render | 0.55 | a little of each |
| the entrance render | 0.75 | the roofline and the burnt-in label |

Two things make this a build step rather than a canvas transform. The crop lands **before** the
downscale, so fitting 1344 rows into the tier width keeps every pixel the tier can hold, where
the same reframe at runtime is an upscale of frames built for the old framing. And shot
boundaries come from the **detected cuts**, so a re-cut of the same edit keeps its framing
without a single number being retyped — only the anchors are written down, in film order.

`crop` fixes its output size once and re-evaluates `y` per frame, which is why the window is
one height for the whole film and only its position moves. Each move lands on a cut, where the
picture is being replaced anyway.

**What it costs.** A shorter frame is a wider one relative to the viewport, so the cover fit
scales up more and trims more from the sides: about 42% of the width against 18% before. The
shots that push in pay for that. The gate banner now runs out of frame at 13.0 s instead of
13.3 s — it was going to be cropped either way, and a caption cropping as the camera arrives at
it reads as the camera moving. Lower `--keep` for more building and more side-trim; raise it for
the reverse.

### Choosing `--fps`

Think in **pixels of scroll per frame**, not frames per second: nothing here runs on a clock.

```
frames  =  duration × fps
pixels per frame  =  (TOUR_VH / 100 × viewport height) / frames
```

The landscape film is `--fps 25` against a 25 fps source: 503 frames, and at `--tour-vh: 1500`
on a 900 px window that is 25 px of scroll per frame. The portrait film is `--fps 15` against
a 30 fps source: 302 frames at `--tour-vh: 900`, or 24 px per frame. Both were 18 px against
the 22.2 s cut these replaced; the film lost two seconds and the numbers moved with it, which
is the direction that costs nothing — a frame held over more scroll is a frame held longer.

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

Two tiers, scheduled completely differently, because they cost completely
different amounts:

| tier | landscape | portrait | how it is fetched |
|---|---|---|---|
| small (640 / 400 AVIF) | **2.2 MB**, 734 frames | **1.4 MB**, 441 frames | **all of it, immediately**, coarse-to-fine, ungated |
| display (1400 / 720 AVIF) | 6.4 MB | 2.2 MB | gesture-gated, windowed, velocity-strided, cancellable |

The small tier is the whole film — every frame — for less than a single hero
photograph. Once that is true, rationing it is the wrong instinct: a windowed,
gesture-gated, velocity-strided fetch of a two-megabyte asset spends its
cleverness making the first impression worse. So it is simply taken, in an
order that makes it usable at every moment along the way — pass one spans the
film in a dozen frames, each pass after halves the gaps — with only the frames
at the playhead allowed to jump the queue.

Everything the old loader did to ration bytes now applies solely to the display
tier, which is 3.5x the size and buys sharpness rather than motion. That is the
tier that can afford to wait, because nobody scrolling quickly can see it.

Sweep requests are issued at `fetchPriority: "low"` and only the frames at the
playhead at `"high"`. Seven hundred high-priority requests at mount would race
the poster, which is the page's largest paint.

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

`public/.htaccess` and the `headers()` block in `next.config.mjs` both used to say that
where two rules match one request, **the later one wins**. Neither works that way when
rules append, so every frame came back as:

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

---

## 8. The first visit, and the edge cache

The last thing to go wrong, and the least obvious. Symptom: **the first visit
stutters and every visit after it is perfect.** The instinct is that this is the
browser cache and therefore unfixable. It is not.

Measured against the deployed site — the same 100 frames, the same client, the
same connection, back to back, with nothing cached locally either time:

| | frames/s |
|---|---|
| cold at the edge (`cf-cache-status: MISS`, fetched from origin) | **3** |
| the same files a minute later, warm at the edge (`HIT`) | **32** |

Ten times, and none of it is the browser. It is Cloudflare.

A film split into hundreds of small objects is close to the worst possible
shape for an edge cache. No individual frame is requested often enough to stay
resident, so they age out, and the next visitor in that region pays an origin
round trip **per frame**. Worse, every deploy mints a new `?v=` fingerprint on
every URL, which empties the edge completely — so without intervention the
first visitor after every deploy gets the bad version of the site.

Three things address it, in order of effort:

1. **Warm the edge after every deploy.** `npm run tour:warm -- https://host`
   pulls every frame through the CDN once. Measured against the live site, the
   small AVIF tier, sampled across the whole film:

   | | edge residency | throughput |
   |---|---|---|
   | before warming | 9/30 resident | 28 frames/s |
   | after warming (2,352 objects, 10.6 MB, 47 s) | **27/30 resident** | **58 frames/s** |

   **This decays.** Cloudflare evicts by least-recently-used, and a film split
   into hundreds of objects is exactly what an LRU sheds first — which is why
   residency was down to 30% on a site that had been live for days. Warming is
   not a one-off after a deploy; on a low-traffic site it wants to be a cron. It warms the ONE PoP that serves the machine it
   runs on, so run it from near the audience: from Jaipur it warms Singapore,
   which is where Indian traffic lands (`cf-ray: …-SIN`). From a US CI runner it
   warms a US PoP and does nothing for India.
2. **Turn on Tiered Cache** (Cloudflare → Caching → Tiered Cache; free on all
   plans). A miss at one PoP then fetches from a regional parent instead of the
   origin, which makes every miss cheaper and lets one warm-up populate the
   parent for every PoP behind it. This is the half that makes warming from one
   location worth anything to the rest of the world.
3. **Atlases, if the first two are not enough.** Packing the small tier into
   tiled sheets — 4×6 frames at 640×360, so 2560×2160 per sheet — turns 734
   objects into **31**, measured at 111 KB each. Thirty-one objects stay
   resident in an edge cache; seven hundred do not, so this fixes the cause
   rather than the symptom. It also collapses the round-trip cost, which is the
   real limit at ~3 KB a frame.

   Not built, deliberately. A decoded 2560×2160 sheet is ~22 MB of pixels
   against ~1 MB for a frame, so it needs a real eviction policy, and that is a
   memory risk on exactly the cheap phones this is all for. Do 1 and 2, measure,
   and only reach for this if the first visit is still short.
