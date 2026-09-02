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

`scripts/build-tour.mjs` is a thin, well-behaved wrapper around ffmpeg:

```
video ──ffmpeg──> public/media/tour/1100/f0001.webp … f0828.webp   (desktop)
              └─> public/media/tour/640/f0001.webp  … f0828.webp   (phones)
              └─> public/media/tour/poster.webp
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

Think in **pixels of scroll per frame**, not frames per second: nothing here runs on a clock.

```
frames  =  duration × fps
pixels per frame  =  (TOUR_VH / 100 × viewport height) / frames
```

What ships (`ref/website-video.mp4`, 33.12 s at 25 fps, `--fps 25`) is 828 frames. At
`TOUR_VH = 1500` on a 900 px window that is 12,600 px of travel, or **15 px of scroll per
frame**; phones take every second frame against a 900 px tour and land at 13 px. Measured on
the shipped build, a 900 px drag draws 60 distinct frames on desktop and 61 on a phone, and
the same drag reversed is pixel-identical at all 61 positions.

Above ~60 px it feels steppy and around 25–40 px reads as continuous, so 15 px is deliberately
past the point of diminishing returns: this is the page's one set piece, and the loader below
means nobody downloads a frame they do not scroll past. **`--fps 12` halves the frame count,
the bytes and the density in one flag** if that trade ever needs making — but keep it an
integer divisor of the source rate (25 → 12.5 → 6.25). A non-divisor makes ffmpeg pick the
nearest source frame for each output slot, so the *content* intervals come out uneven while
the scroll mapping stays uniform, and that reads as judder no easing can fix.

---

## 4. The runtime

`src/components/sections/ScrollTour.tsx`. Four parts.

### 4a. Picking a size

```js
const dpr = Math.min(devicePixelRatio, 1.75);
const needed = innerWidth * dpr;
const chosen = sizes.find(s => s.width >= needed * 0.85) ?? largest;
```

DPR is capped at 1.75: a 3x retina phone does not need a 4,000 px source for a full-bleed
soft-focus film, and the memory saved matters more than the sharpness lost.

### 4b. Loading, coarse-to-fine

Naively loading `f0001 … f0240` in order means the first three seconds are pristine while the
end of the tour is still blank, and a visitor who flicks to the bottom sees nothing. So the
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

The whole film is ~28 MB at the desktop size. Fetching all of it on load would be the single
most expensive thing this page does, and most of it would be spent on people who never reach
the second beat. So it arrives in three phases and only the first is unconditional:

| phase | what | when |
|---|---|---|
| PRIME | a wide stride across the whole film, ~26 frames | immediately |
| COARSE | one more pass at twice the density | first scroll, wheel, key or touch |
| WINDOW | the rest, ±90 track positions around the playhead, forward first | same gesture, then travels with the playhead |

The window is what makes the scrub smooth; the strided passes are what make an arbitrary jump
land on something. Measured payload, 1440 px viewport:

| visitor | frames | tour bytes | page total |
|---|---|---|---|
| opened, never scrolled | 26 | 0.90 MB | 1.86 MB |
| scrolled two screens | 192 | 5.14 MB | 6.10 MB |
| watched the whole film | 806 | 28.19 MB | 30.57 MB |
| watched the whole film, phone | 415 | 6.48 MB | 8.86 MB |

Gating on a gesture rather than on `load` is the difference between a 1.9 MB page and a
3.6 MB one for the visitor who bounces. The rAF loop also opens the taps if it ever finds the
playhead off zero, which covers a flick that lands between the HTML arriving and the component
mounting — there is no scroll event left to hear by then, but the film is plainly not at the
top, and that is the same evidence.

### 4f. Never a blank frame

Three fallbacks stack up:

1. The poster `<img>` sits OVER the canvas and fades out once there are real frames. Not under
   it: the 2D context is requested with `alpha: false` for draw speed, and an opaque canvas is
   **black** until something is drawn into it, so underneath the poster it covered the poster
   completely. That cost 3.7 s of LCP render delay on a throttled phone before it was caught.
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

- **Weight.** 28.6 MB at 1100 px and 12.9 MB at 640 px on disk, 828 frames each. What any one
  visitor actually pays is in the table in 4e. Serve it from a CDN; the frames are immutable
  and cache forever.
- **Requests.** 828 per size, but only the ones scrolled past. Fine over HTTP/2, and they
  arrive coarse-to-fine so the tour is usable long before the last one lands.
- **AVIF would halve it.** Measured on this footage, 12.0 KB/frame against WebP's 24.8 at the
  same width and comparable quality. Not taken: it needs a WebP tier alongside it for the
  browsers that lack it, which doubles the build and the disk, and AVIF decode is the slower
  of the two on exactly the phones that would benefit most from the bytes. Worth revisiting
  when the support floor moves.
- **Memory.** A few hundred decoded bitmaps is real memory pressure. The DPR cap and the two-size
  ladder keep it reasonable; if you push past ~400 frames, drop the widths.
- **Not free on first load.** There is a genuine loading state, shown as a percentage. A video
  starts painting sooner. That is the trade for never stuttering afterwards.
