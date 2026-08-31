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

### Approach A — scrub a `<video>` with `currentTime`

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
than going down — and it is bursty, because the cost spikes at every keyframe boundary.
That is precisely the "fine going down, not smooth at all going up" report.

You can soften it (short GOP, all-intra encoding, easing the playhead), and the Royal Palace
build does all three. You cannot remove it, because the browser still runs a demux → decode →
paint cycle for every seek, and Safari in particular serialises them.

### Approach B — an image sequence on a canvas ← **what this site does**

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
| Royal Palace — video `currentTime` scrub | p95 **50.0 ms**, 155 frames over 32 ms | p95 **33.4 ms**, 124 frames over 32 ms |
| JECRC — canvas image sequence | p95 **16.8 ms**, 20 frames over 32 ms | p95 **16.8 ms**, 3 frames over 32 ms |

60 fps is a 16.7 ms budget. The video version misses it on most frames going up; the canvas
version essentially never does, in either direction.

---

## 3. The build step

`scripts/build-tour.mjs` is a thin, well-behaved wrapper around ffmpeg:

```
video ──ffmpeg──> public/media/tour/1600/f0001.webp … f0240.webp   (desktop)
              └─> public/media/tour/900/f0001.webp  … f0240.webp   (phones)
              └─> public/media/tour/poster.jpg
              └─> public/media/tour/manifest.json  (+ copy into src/lib/)
```

The essential ffmpeg call per size is just:

```bash
ffmpeg -ss <start> -i <video> -t <span> \
       -vf "fps=8,scale=1600:-2" \
       -c:v libwebp -quality 58 -compression_level 5 \
       public/media/tour/1600/f%04d.webp
```

The manifest records the frame count, the sizes, the file extension and the zero-padding, so
the component never has to guess a filename.

### Choosing `--fps`

Think in **pixels of scroll per frame**, not frames per second — nothing here runs on a clock.

```
frames  =  duration × fps
pixels per frame  =  (TOUR_VH / 100 × viewport height) / frames
```

At the defaults — 30 s, 8 fps, `TOUR_VH = 900`, an 800 px window — that is 240 frames over
7,200 px, or **30 px of scroll per frame**. Around 25–40 px reads as continuous motion. Below
~15 px you are paying for frames nobody perceives; above ~60 px it starts to feel steppy.

---

## 4. The runtime

`src/components/ScrollTour.tsx`. Four parts.

### 4a. Picking a size

```js
const dpr = Math.min(devicePixelRatio, 1.75);
const needed = innerWidth * dpr;
const chosen = sizes.find(s => s.width >= needed * 0.85) ?? largest;
```

DPR is capped at 1.75 — a 3× retina phone does not need a 4,000 px source for a full-bleed
soft-focus film, and the memory saved matters more than the sharpness lost.

### 4b. Loading, coarse-to-fine

Naively loading `f0001 … f0240` in order means the first three seconds are pristine while the
end of the tour is still blank — and a visitor who flicks to the bottom sees nothing. So the
queue is built in passes of decreasing stride:

```js
for (const stride of [16, 8, 4, 2, 1])
  for (let i = 0; i < count; i += stride)
    if (!queued(i)) queue.push(i);
```

Pass one is every 16th frame: 15 images, the entire timeline covered, coarse but complete.
Then every 8th, every 4th, and so on. The component reveals as soon as pass one lands.

Eight requests are in flight at a time, and the next pick is biased toward whatever is on
screen right now:

```js
// among the next 48 queued frames, take the one nearest the current index
```

so a visitor who jumps to the middle gets the middle filled in first.

### 4c. Decoding off the paint path

```js
img.onload = () => {
  if (img.decode) img.decode().then(settle, settle);
  else settle();
};
```

`onload` only means the bytes arrived. The first `drawImage` of an undecoded image decodes it
**synchronously, inside your rAF callback** — a 5–15 ms stall right when you are trying to
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
then a lerp easing `currentTime` toward the scrubbed value — three filters in series. Each is
defensible alone; stacked, they put visible latency between your fingers and the picture, and
latency reads as lag most strongly when you reverse direction, because every filter has to
unwind before the image turns around.

Here Lenis smooths the scroll position once and nothing touches it again. One scroll position
always maps to exactly one frame index, which is why scrolling up is bit-for-bit the reverse
of scrolling down — verified by hashing the canvas at 25 positions on the way down and again
on the way up: **25/25 identical**.

### 4e. Never a blank frame

Three fallbacks stack up:

1. A poster `<img>` sits under the canvas until the first pass has loaded.
2. `nearest(i)` walks outward from the requested index to the closest frame that *is* loaded,
   so a half-loaded tour shows the nearest real picture rather than nothing.
3. Under `prefers-reduced-motion: reduce` the whole loop is skipped: one frame is loaded,
   painted once, and the opening caption is shown.

---

## 5. The captions

Same progress value, different consumer. Each caption declares the window it lives in:

```ts
{ at: [0.23, 0.42], eyebrow: "The campus", title: "Everything here is a workshop" }
```

and gets opacity from a pair of ramps — in over the first 4.5% of its window, out over the
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

- **Weight.** The placeholder is ~19 MB of WebP across two sizes. The real film, being AI-generated
  and smoother, should compress better at the same settings. Serve it from a CDN; the frames are
  immutable and cache forever.
- **Requests.** 240 per size. Fine over HTTP/2, and they arrive coarse-to-fine so the tour is
  usable long before the last one lands.
- **Memory.** A few hundred decoded bitmaps is real memory pressure. The DPR cap and the two-size
  ladder keep it reasonable; if you push past ~400 frames, drop the widths.
- **Not free on first load.** There is a genuine loading state, shown as a percentage. A video
  starts painting sooner. That is the trade for never stuttering afterwards.
