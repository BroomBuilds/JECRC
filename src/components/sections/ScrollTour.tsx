"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import landscapeFilm from "@/lib/tour-manifest-landscape.json";
import portraitFilm from "@/lib/tour-manifest-portrait.json";
import { APPLY_LINKS } from "@/lib/content/universities";
import { BRAND, LOGO } from "@/lib/content/site";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * Scroll length of the tour.
 *
 * Set in CSS rather than here so it can differ by screen: 1500vh on a desktop
 * is fifteen screens of film, and the same number on a 780px phone is a wall
 * the visitor has to climb before reaching anything else. See `--tour-vh` in
 * globals.css.
 */
export const TOUR_HEIGHT = "var(--tour-vh)";

export type Caption = {
  /** [fade-in point, fade-out point] as fractions of the tour, 0 to 1. */
  at: [number, number];
  /**
   * Width of the fade ramps, in the same units. Defaults to 0.045.
   *
   * The closing beat needs its own: it arrives inside the ending's own
   * choreography rather than on an open stretch of film, and a beat whose
   * `at[1]` is parked past 1 so it never fades out cannot use a ramp wide
   * enough to still be arriving when the tour runs out of scroll.
   */
  ramp?: number;
  eyebrow?: string;
  title: string;
  sub?: string;
  tagline?: string;
  /** "hero" opens with the crest, "apply" closes with the three portals. */
  variant?: "hero" | "apply";
};

/**
 * A single apply stamp riding along mid-film.
 *
 * `campus` indexes APPLY_LINKS. There is no position field: every stamp lands
 * on the same anchor, and only the moment changes.
 */
export type ApplyBeat = {
  /** [fade-in point, fade-out point] as fractions of the tour, 0 to 1. */
  at: [number, number];
  campus: number;
};

type Props = { captions?: Caption[]; applyBeats?: ApplyBeat[] };

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const smooth = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

type Tier = { width: number; height: number; dir: string };

/** What `scripts/build-tour.mjs` writes, and the only thing this reads. */
type Film = {
  count: number;
  rev: string;
  fps: number;
  duration: number;
  pad: number;
  base: string;
  poster: string;
  aspect: number;
  orientation: string;
  /** Every Nth frame of the smallest tier covers the film end to end. */
  spineStride: number;
  /** Hard cuts, as fractions of the film. Dissolved rather than painted. */
  cuts: number[];
  formats: {
    avif: { ext: string; sizes: Tier[] };
    webp: { ext: string; sizes: Tier[] };
  };
};

/**
 * Does this browser decode AVIF?
 *
 * It matters more than any other single decision here. Measured on this
 * footage: WebP q50 at 1100px is 55 KB a frame, AVIF crf36 at 1400px is 8.9 —
 * a fifth of the bytes at a larger size. Over a link measured at 5.5 Mbps that
 * is 16 frames a second delivered against 36, and a deliberate scroll through
 * the tour needs about 16 while a normal scroll-past needs 66. Format is the
 * difference between a film that flows on a first visit and one that cannot.
 *
 * A 2×2 AVIF as a data URI: no network, resolves in about a millisecond, and
 * started here at module scope so the answer is already waiting by the time
 * the component mounts. Browsers without AVIF fall back to a WebP tier built
 * at the width the site shipped before, so they are never worse off than they
 * were — they simply do not get the improvement.
 */
const AVIF_OK: Promise<boolean> =
  typeof window === "undefined"
    ? Promise.resolve(false)
    : new Promise((res) => {
        const probe = new window.Image();
        probe.onload = () => res(probe.width === 2);
        probe.onerror = () => res(false);
        probe.src =
          "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAD1bWV0YQAAAAAAAAAvaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAFBpY3R1cmVIYW5kbGVyAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAAR0AAAAZAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGZpcHJwAAAAR2lwY28AAAAUaXNwZQAAAAAAAAACAAAAAgAAABBwaXhpAAAAAAMICAgAAAAIYXYxQwAAABNjb2xybmNseAACAAIAAgAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACFtZGF0CgkAAAAABm18wCAyDBAA/4AAAsAAAACvMA==";
      });

/**
 * Scroll-driven film, rendered as an image sequence on a canvas.
 *
 * Not a <video> scrubbed with currentTime. Seeking compressed video is
 * asymmetric: forward is one frame of decode, backward means jumping to the
 * previous keyframe and decoding forward to the target, which is why video
 * scrubbing feels fine going down and awful coming back up. A decoded image
 * sequence has no keyframes and no decoder state, so frame N costs the same
 * whichever direction you arrived from.
 *
 * Frames come from `npm run tour:build <video>`. The full write-up, including
 * the measurements behind this choice, is in TOUR.md.
 */
export default function ScrollTour({ captions = [], applyBeats = [] }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sealRefs = useRef<(SVGSVGElement | null)[]>([]);
  const uid = useId();
  const cutId = `${uid}-cut`;
  const liftId = `${uid}-lift`;
  const [pct, setPct] = useState(0);
  const [primed, setPrimed] = useState(false);

  useEffect(() => {
    const sec = section.current;
    const cv = canvas.current;
    if (!sec || !cv) return;

    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- which film ------------------------------------------------------
    // One film per shape, chosen once and never re-chosen. The portrait cut is
    // not the landscape one letterboxed — it is a separate edit at a separate
    // aspect — and deciding here rather than in CSS is what keeps a phone from
    // ever touching the landscape frames.
    const m: Film = (window.matchMedia("(orientation: portrait)").matches
      ? (portraitFilm as Film)
      : (landscapeFilm as Film));
    const { count, base, pad, rev, spineStride, cuts } = m;

    // ---- frame store -----------------------------------------------------
    // HTMLImageElement rather than ImageBitmap on purpose. A bitmap would give
    // cleaner cancellation and off-thread decode, but it also pins decoded
    // pixels that only an explicit close() frees: at 1400×788 that is 4.4 MB a
    // frame, and a few hundred of them is a phone falling over. An <img> lets
    // the browser discard and re-decode under pressure, which is the behaviour
    // this needs and none of the code has to implement.
    const images: (HTMLImageElement | undefined)[] = new Array(count);
    /**
     * Which tier index each loaded frame came from; -1 for not loaded.
     *
     * One array rather than a `ready` flag beside it: a frame's tier already
     * says whether it is loaded, and two arrays that must agree are two arrays
     * that can disagree.
     */
    const tierOf = new Int8Array(count).fill(-1);
    /** In-flight request per frame, so a stale one can be aborted. */
    const inflightImg = new Map<number, HTMLImageElement>();
    /** Tier index of the in-flight request, to avoid re-asking for the same. */
    const inflightTier = new Int8Array(count).fill(-1);
    let loadedCount = 0;
    /** Frame index under the playhead right now. */
    let cursor = 0;

    // ---- tiers, once the format is known ---------------------------------
    // Everything below waits on AVIF_OK, which is a data URI decode started at
    // module scope: it has almost always settled before this effect runs, and
    // costs about a millisecond when it has not. The poster is over the canvas
    // for the whole of that window, so nothing is visibly waiting.
    let tiers: Tier[] = [];
    let displayTier = 0;
    let spineTier = 0;
    // Replaced by `chooseTiers` before anything is allowed to call it; the
    // placeholder exists only so the closures below can capture the binding.
    let url: (tier: number, i: number) => string = () => "";
    let started = false;

    // Capped at 1.75: a 3x phone does not need a 4,000px source for a
    // full-bleed, soft-focus film, and the memory saved matters more than the
    // sharpness lost.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const needed = window.innerWidth * dpr;

    const chooseTiers = (avif: boolean) => {
      const fmt = avif ? m.formats.avif : m.formats.webp;
      tiers = [...fmt.sizes].sort((a, b) => a.width - b.width);
      const fit = tiers.findIndex((s) => s.width >= needed * 0.85);
      displayTier = fit === -1 ? tiers.length - 1 : fit;
      // The spine is the cheapest tier there is. On the WebP fallback path
      // there is only one tier, so spine and display are the same and the
      // phasing below collapses to what the site did before — which is exactly
      // the intent: no visitor is worse off than they were.
      spineTier = 0;
      // ?v= is the film's fingerprint, written by scripts/build-tour.mjs.
      // Frame paths repeat build to build and the frames are served immutable
      // for a year, so without the query a phone that cached one cut never
      // sees another.
      url = (tier: number, i: number) =>
        `${base}/${avif ? "avif" : "webp"}/${tiers[tier].dir}/f${String(i + 1).padStart(pad, "0")}.${fmt.ext}?v=${rev}`;
    };

    // ---- what to fetch, and when -----------------------------------------
    //
    // Three phases, in strict priority order. Only the first is unconditional:
    //
    //   SPINE     every `spineStride`th frame of the SMALLEST tier, ordered
    //             coarse-to-fine so even the spine's own first pass spans the
    //             whole film. Requested immediately. On this film that is 92
    //             frames at 1.7 KB — about 160 KB for complete end-to-end
    //             coverage, less than the poster costs, so no scroll position
    //             is ever without a real picture.
    //   FILL      the frames between, at the same small tier, inside a window
    //             that travels with the playhead.
    //   UPGRADE   the display tier, near the playhead, and only while the
    //             visitor is moving slowly enough for the difference to be
    //             visible at all.
    //
    // FILL and UPGRADE wait for a first gesture. A tab opened and abandoned
    // should not cost megabytes to abandon, and nothing but a scroll is
    // evidence that anyone means to watch a thirty-second film.
    //
    // The velocity stride is what makes a fast scroll survive, and it is the
    // fix for the fault that started all of this. Density that cannot arrive
    // in time is not just wasted, it is actively harmful: it fills the
    // connection with frames the playhead has already passed, so the frames
    // under the playhead queue behind them and the film appears to freeze and
    // then snap. Fast scrolling wants frames SPARSE AND FAR; slow scrolling
    // wants them DENSE AND NEAR. Same budget, opposite shape.
    //
    // So the stride is the ratio of two measured rates rather than a constant:
    // how much film is passing under the playhead, over how much film this
    // connection is actually delivering. Neither is guessable — a 5 Mbps link
    // in Jaipur reaching a Singapore edge is not the link this was written on
    // — so both are measured live and the stride follows them.
    /** Frames at or just ahead of the playhead that outrank the sweep. */
    const URGENT = 24;
    /** Frames behind the playhead still worth an upgrade. */
    const BEHIND = 50;
    /** How far out the display tier is worth chasing when standing still. */
    const UPGRADE_REACH = 60;
    /**
     * Requests in flight.
     *
     * Higher than the eight-then-sixteen this used to ramp between, because the
     * objects are now a twentieth of the size they were: at ~2 KB a frame the
     * limit is round trips, not bandwidth, and the only way to hide a round
     * trip is to have another request already in it. HTTP/2 multiplexes them
     * onto one connection, so this is queue depth rather than sockets.
     *
     * Measured against the deployed site, 100 frames of the small tier, warm
     * at the edge:
     *
     *   6 → 41/s    10 → 55/s    16 → 49/s    24 → 65/s    32 → 18/s
     *
     * Noisy, and the shape matters more than any single number: throughput
     * climbs to somewhere in the twenties and then FALLS OFF A CLIFF. Past the
     * point where the queue is deeper than the connection can service, the
     * requests at the back are just latency added to the ones at the front.
     *
     * Sixteen rather than the twenty-four that measured fastest, deliberately.
     * That measurement is one desktop on one link; a phone on a worse one
     * reaches the cliff sooner, and the downside of being under the peak is a
     * few frames a second while the downside of being over it is a third of the
     * throughput. This is the calibration knob — if it is ever retuned, measure
     * the cliff on a real device rather than the peak on a fast one.
     */
    const CONCURRENCY = 16;

    /**
     * Every frame of the small tier, coarse-to-fine, from the widest useful
     * stride down to every one.
     *
     * The whole plan, not just a spine. The small tier is 2.2 MB for the
     * landscape film and 1.4 MB for the portrait one — the entire film, every
     * frame — which is less than a single hero photograph on most pages. Once
     * that is true, rationing it is the wrong instinct: a windowed,
     * gesture-gated, velocity-strided fetch of a two-megabyte asset spends its
     * cleverness making the first impression worse.
     *
     * So the small tier is simply taken, in an order that makes it usable at
     * every moment along the way: pass one covers the film end to end in a
     * dozen frames, and each pass after that halves the gaps. The display
     * tier — 3.5x the bytes — keeps all of the rationing.
     */
    const smallPlan: number[] = [];
    {
      const seen = new Uint8Array(count);
      const push = (i: number) => {
        if (i < count && !seen[i]) {
          seen[i] = 1;
          smallPlan.push(i);
        }
      };
      // Start wide enough that the first pass spans the film in ~12 frames,
      // then halve until every frame is planned.
      for (let s = 2 ** Math.ceil(Math.log2(Math.max(2, count / 12))); s >= 1; s >>= 1) {
        for (let i = 0; i < count; i += s) push(i);
      }
      push(count - 1);
    }
    /**
     * How much of the plan counts as "the film is usable end to end".
     *
     * Only this much drives the loading percentage and the poster fade. The
     * rest arrives behind it without anyone being told about it, because by
     * then there is a real picture at every scroll position and the visitor
     * has nothing left to wait for.
     */
    const SPINE_COUNT = Math.min(smallPlan.length, Math.max(24, Math.ceil(count / spineStride)));
    let planAt = 0;
    let windowOpen = false;

    // ---- the two measured rates ------------------------------------------
    /**
     * Frames per second this connection is actually delivering.
     *
     * Seeded at 10 and replaced by measurement inside the first half second.
     * An EMA rather than a running mean: a link that degrades halfway down the
     * page has to be believed, not averaged away.
     */
    let rate = 10;
    let settledSince = 0;
    let rateAt = 0;
    const noteSettled = () => {
      const now = performance.now();
      settledSince++;
      if (!rateAt) {
        rateAt = now;
        return;
      }
      const dt = now - rateAt;
      if (dt >= 400) {
        rate += ((settledSince * 1000) / dt - rate) * 0.4;
        settledSince = 0;
        rateAt = now;
      }
    };

    /** Frames of film passing under the playhead per second. Written by the loop. */
    let passRate = 0;

    const fetchStride = () =>
      Math.max(1, Math.min(8, Math.ceil(passRate / Math.max(3, rate))));

    let disposed = false;
    let dirty = true;

    /**
     * Abandon requests the playhead has left behind.
     *
     * Without this a fast scroller's connection stays full of frames that were
     * relevant two seconds ago: they were asked for, they are still coming,
     * and every one of them is a slot the frames under the playhead are
     * waiting behind. Setting `src` to empty is what actually cancels an
     * in-flight image request; clearing the handlers first stops a response
     * that is already on the wire from settling into the store afterwards.
     *
     * The window here is deliberately wider than the fetch window. A frame
     * just outside it is one the visitor is about to reach, and throwing away
     * a request that is nearly finished costs more than keeping it.
     */
    const abortStale = () => {
      for (const [i, img] of inflightImg) {
        // Small-tier requests are never stale. Every one of them is wanted,
        // wherever the playhead is, because the whole tier is being taken;
        // cancelling one only means asking for it again later.
        if (inflightTier[i] !== displayTier || displayTier === spineTier) continue;
        if (i > cursor - BEHIND * 2 && i < cursor + UPGRADE_REACH * 2) continue;
        img.onload = null;
        img.onerror = null;
        img.src = "";
        inflightImg.delete(i);
        inflightTier[i] = -1;
      }
    };

    /** Next frame worth fetching and the tier to fetch it at, or null. */
    const pick = (): { i: number; tier: number } | null => {
      // URGENT. A frame the playhead is on or about to reach, still missing at
      // any tier, jumps the queue. This is the only part of the small tier's
      // schedule that depends on where the visitor is, and it exists so that
      // someone who scrolls immediately is not waiting on a coarse pass
      // covering film they are already past.
      for (let d = 0; d <= URGENT; d++) {
        const f = cursor + d;
        if (f < count && tierOf[f] < 0 && inflightTier[f] < 0) return { i: f, tier: spineTier };
      }

      // SWEEP. The entire small tier, coarse-to-fine, unconditionally. Not
      // gated on a gesture and not strided by velocity: at 2.2 MB for the whole
      // film there is nothing here worth rationing, and rationing it is what
      // made a first visit feel worse than a reload.
      while (planAt < smallPlan.length) {
        const i = smallPlan[planAt++];
        if (tierOf[i] < 0 && inflightTier[i] < 0) return { i, tier: spineTier };
      }

      // UPGRADE. Everything the small tier is not: gated on a gesture, held to
      // a window around the playhead, and only while the film is arriving
      // faster than the visitor is consuming it. This tier is 3.5x the bytes
      // and buys sharpness rather than motion, so it is the one that waits.
      //
      // Someone flying past the tour gets the small tier and is none the
      // wiser; someone who stops to look gets the large one within a few
      // frames of stopping.
      if (!windowOpen || displayTier === spineTier) return null;
      if (passRate >= rate * 0.75) return null;
      const reach = Math.min(UPGRADE_REACH, Math.ceil(UPGRADE_REACH / fetchStride()));
      for (let d = 0; d <= reach; d++) {
        const f = cursor + d;
        if (f < count && tierOf[f] === spineTier && inflightTier[f] < 0) return { i: f, tier: displayTier };
        if (d > 0 && d <= BEHIND) {
          const b = cursor - d;
          if (b >= 0 && tierOf[b] === spineTier && inflightTier[b] < 0) return { i: b, tier: displayTier };
        }
      }
      return null;
    };

    const pump = () => {
      if (!started || disposed) return;
      abortStale();
      while (inflightImg.size < CONCURRENCY) {
        const next = pick();
        if (!next) return;
        const { i, tier } = next;
        inflightTier[i] = tier;

        const img = new window.Image();
        img.decoding = "async";
        // Only what the playhead is about to need is urgent. The sweep is
        // explicitly LOW, which matters now that it is the whole tier rather
        // than a few dozen frames: seven hundred high-priority requests issued
        // at mount would be racing the poster, and the poster is the largest
        // paint on the page. Low here does not mean slow — the connection is
        // otherwise idle within a second — it means the browser is told what to
        // do first if it ever has to choose.
        img.fetchPriority = Math.abs(i - cursor) <= URGENT ? "high" : "low";
        inflightImg.set(i, img);

        const settle = () => {
          // A request aborted mid-flight can still settle. If this image is no
          // longer the one on record for the frame, it is that.
          if (inflightImg.get(i) !== img) return;
          inflightImg.delete(i);
          inflightTier[i] = -1;
          // Never downgrade. A display-tier frame already in hand beats a
          // spine frame arriving late, which happens whenever an upgrade
          // overtakes the fill request it was racing.
          if (tier > tierOf[i]) {
            if (tierOf[i] < 0) loadedCount++;
            images[i] = img;
            tierOf[i] = tier;
            dirty = true;
          }
          noteSettled();
          if (loadedCount <= SPINE_COUNT) {
            setPct(Math.min(100, Math.round((loadedCount / SPINE_COUNT) * 100)));
          }
          // The spine covers the timeline end to end, so a quarter of it is
          // already enough to show a real picture wherever the visitor is.
          // Waiting for all of it would hold the poster over a canvas that has
          // something better to show.
          if (!disposed && loadedCount >= Math.min(count, Math.ceil(SPINE_COUNT / 4))) {
            setPrimed(true);
          }
          pump();
        };

        img.onload = () => {
          // onload only means the bytes arrived. The first drawImage of an
          // undecoded image decodes it synchronously inside the rAF callback,
          // a 5 to 15ms stall in a 16.7ms budget — and AVIF decodes slower
          // than WebP, so this matters more now than it did. Decoding here
          // moves that off the paint path entirely.
          if (typeof img.decode === "function") img.decode().then(settle, settle);
          else settle();
        };
        img.onerror = () => {
          if (inflightImg.get(i) === img) {
            inflightImg.delete(i);
            inflightTier[i] = -1;
          }
          pump();
        };
        img.src = url(tier, i);
      }
    };

    // Loading cannot begin until the format is known. The probe is a data URI
    // decode started at module scope, so this has almost always already
    // resolved by the time the effect runs.
    //
    // Not under reduced motion, which has its own single-frame path further
    // down and must not also be handed a spine to fetch.
    if (!reduced) {
      AVIF_OK.then((ok) => {
        if (disposed) return;
        chooseTiers(ok);
        started = true;
        pump();
      });
    }

    /** First gesture: open the travelling window and the upgrade pass. */
    const open = () => {
      if (disposed || windowOpen) return;
      windowOpen = true;
      pump();
    };
    const GESTURES = ["scroll", "wheel", "keydown", "touchstart"] as const;
    for (const g of GESTURES) {
      window.addEventListener(g, open, { once: true, passive: true });
    }

    // ---- drawing ---------------------------------------------------------
    let lastDrawn = -1;
    let lastImg: HTMLImageElement | undefined;

    // Capped rather than open-ended. With the sequence loaded sparsely there is
    // always something within half a stride, and an uncapped walk would scan
    // the whole array on every paint in the gap before the spine lands.
    //
    // Tied to the spine stride rather than fixed at 64. The old constant meant
    // the canvas could be showing a frame two and a half seconds of film away
    // from the one the scroll position asks for, painted hard and with nothing
    // to say it was wrong. Three spine strides is as far as it can be from a
    // real picture once the spine has landed, and anything past that is better
    // admitted than papered over.
    const REACH = Math.max(24, spineStride * 3);

    /** How far the last `nearest` call had to walk. Read by `paint` for blur. */
    let lastDist = 0;

    const nearest = (i: number) => {
      if (tierOf[i] >= 0) {
        lastDist = 0;
        return images[i];
      }
      for (let d = 1; d <= REACH; d++) {
        if (i - d >= 0 && tierOf[i - d] >= 0) {
          lastDist = d;
          return images[i - d];
        }
        if (i + d < count && tierOf[i + d] >= 0) {
          lastDist = d;
          return images[i + d];
        }
      }
      // Nothing near: hold the last good frame rather than leaving the canvas
      // on whatever was there. The poster is still over the top at this point.
      lastDist = REACH;
      return lastImg;
    };

    // ---- the cuts --------------------------------------------------------
    //
    // The film is a montage: eleven hard cuts in thirty seconds, found at build
    // time and listed in the manifest. Played at 25 fps a cut passes in 40 ms
    // and reads as film grammar. Under a scrub the VISITOR sets the timing, so
    // the same cut becomes one picture replaced by an unrelated picture at
    // whatever speed a thumb chose, with no motion carrying the eye across it.
    // It reads as breakage, and eleven of them read as a broken page.
    //
    // So the cut is never painted as a cut. Across a short span either side of
    // it the two shots are cross-dissolved, and a dissolve is legible at ANY
    // scrub speed because it is a transition rather than the absence of one.
    //
    // The frames blended are pinned — the last frame of the outgoing shot and
    // the first of the incoming one — so the dissolve is a pure function of
    // scroll position and stays exactly reversible, which is the property the
    // whole scrub is built on.
    const cutFrames = cuts.map((c) => Math.round(c * (count - 1))).filter((c) => c > 0 && c < count);
    const DISSOLVE = Math.max(3, Math.round(count / 110));
    const CUT_BLUR = 5;

    const cutNear = (i: number) => {
      for (let k = 0; k < cutFrames.length; k++) {
        const c = cutFrames[k];
        if (i > c - DISSOLVE - 1 && i < c + DISSOLVE) return c;
      }
      return -1;
    };

    /**
     * Blur for this frame, in pixels. Written here, applied by `applyOverlay`,
     * which owns the canvas `filter` because the ending also writes to it.
     *
     * Two sources, whichever is larger. Through a dissolve it peaks at the
     * midpoint: without it you see two distinct pictures overlapping, which
     * looks like a double exposure rather than a transition, and blur is what
     * blends them into one movement. Away from a cut it tracks how far the
     * nearest loaded frame is from the one actually asked for, so a film that
     * is still arriving goes soft rather than jumping — the gap becomes
     * something the page is doing rather than something that is wrong with it.
     *
     * As a CSS filter on the element, never `ctx.filter`: the canvas is the
     * full viewport, and blurring it in the 2D context is a per-pixel pass on
     * every paint, where the compositor does the same thing for free.
     */
    let frameBlur = 0;

    /**
     * The closing push, as a multiplier on the cover scale.
     *
     * In the draw rather than as a CSS transform on the canvas element. The
     * canvas is the full viewport and `object-fit` does not apply to it, so a
     * CSS scale would enlarge the ELEMENT past the stage and leave the
     * compositor upscaling an already-rasterised bitmap: soft on the way in,
     * and one more layer for a phone to hold. Recomputing the destination
     * rectangle costs nothing, because the frame under it is not changing.
     */
    let push = 1;

    /** Last string written to `cv.style.filter`, so it is only written on change. */
    let lastFilter = "";

    const drawCover = (img: HTMLImageElement, alpha: number) => {
      const cw = cv.width;
      const ch = cv.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight) * push;
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      if (alpha !== 1) ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      if (alpha !== 1) ctx.globalAlpha = 1;
    };

    const paint = (i: number) => {
      const c = cutNear(i);
      if (c > 0) {
        // Inside a cut. The outgoing shot's last frame is held under the
        // incoming shot's first, which is faded in across the span. Both ends
        // of the blend are fixed frames, so scrolling back up unwinds the
        // dissolve exactly rather than approximately.
        const a0 = c - DISSOLVE;
        const t = clamp01((i - a0) / (DISSOLVE * 2));
        const outgoing = nearest(Math.min(i, c - 1));
        const dOut = lastDist;
        const incoming = nearest(Math.max(i, c));
        const dIn = lastDist;
        if (outgoing && incoming) {
          lastImg = t < 0.5 ? outgoing : incoming;
          drawCover(outgoing, 1);
          drawCover(incoming, t);
          frameBlur = Math.max(
            Math.sin(t * Math.PI) * CUT_BLUR,
            Math.min(Math.max(dOut, dIn) / 8, 3)
          );
          return;
        }
        // One side of the dissolve has not arrived. Fall through and paint
        // whatever is nearest rather than showing nothing.
      }
      const img = nearest(i);
      if (!img) return;
      lastImg = img;
      drawCover(img, 1);
      frameBlur = Math.min(lastDist / 8, 3);
    };


    // The denominator the film is scrubbed against. Deliberately NOT
    // `window.innerHeight` read fresh every frame.
    //
    // A phone's URL bar slides away as you scroll down and slides back as you
    // scroll up, and `innerHeight` grows and shrinks by 60 to 130px with it.
    // Dividing by a denominator that moves mid-scroll makes the film jump
    // forward the instant the chrome retracts, which is the lurch you feel a
    // few screens in. So this is measured once and only re-measured on a real
    // resize: a rotation or a width change, or a height change far larger than
    // any browser toolbar.
    //
    // 200px is the calibration knob. Toolbars run to about 130px on the
    // tallest Android chrome; a genuine window resize is almost always more.
    const TOOLBAR_SLACK = 200;
    let lastW = window.innerWidth;
    let stageH = window.innerHeight;

    const resize = () => {
      // The canvas always matches the live viewport, because the stage is
      // `h-dvh` and tracks it too. Sizing the bitmap to a frozen height is
      // what leaves an unpainted band under the film.
      const w = Math.round(window.innerWidth * dpr);
      const h = Math.round(window.innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        dirty = true;
      }
      if (window.innerWidth !== lastW || Math.abs(window.innerHeight - stageH) > TOOLBAR_SLACK) {
        lastW = window.innerWidth;
        stageH = window.innerHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    // iOS fires this and not always `resize` when the toolbar collapses.
    window.visualViewport?.addEventListener("resize", resize);

    // Scrub position and smoothed velocity, read by `applyOverlay` below.
    //
    // Declared HERE and not down with the rAF loop, which is where they used
    // to live. The reduced-motion branch calls `applyOverlay(0)` before that
    // point, so reading `lastP` hit its temporal dead zone and threw
    // ReferenceError out of the effect — which React treats as unrecoverable
    // and answers by unmounting the tree. Every visitor with "reduce motion"
    // turned on got a blank page, and never a broken tour, which is why it
    // survived: the one code path that crashes is the one nobody demos on.
    let lastP = 0;
    let vel = 0;

    // ---- overlay, driven by the same progress value ----------------------
    // Written straight to style, not through state: this runs every frame and
    // a setState per frame would be sixty React renders a second to change two
    // properties React does not otherwise own.
    const applyOverlay = (p: number) => {
      capRefs.current.forEach((el, k) => {
        const c = captions[k];
        if (!el || !c) return;
        const [a, b] = c.at;
        const ramp = c.ramp ?? 0.045;
        // A caption anchored at 0 is already on screen at load, so it skips
        // its fade-in rather than starting invisible.
        const fadeIn = a <= 0 ? 1 : smooth(p, a, a + ramp);
        const fadeOut = 1 - smooth(p, b - ramp, b);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - fadeIn) * 24}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });
      // Scrub velocity, smoothed. Two things ride on it, and both exist to
      // make the stamp read as an object travelling with the film rather than
      // a sticker on the glass: it leans into the direction of travel, and it
      // squashes very slightly as it does.
      const dp = p - lastP;
      lastP = p;
      vel += (dp - vel) * 0.25;
      const lean = Math.max(-1, Math.min(1, vel * 60));

      // The same smoothed velocity the stamp leans on, restated as the thing
      // the loader needs: frames of film passing under the playhead per
      // second. `vel` is progress per animation frame, so scaling by the frame
      // count and by 60 gives frames per second directly. This is half of the
      // fetch stride — the other half is how fast the connection is actually
      // delivering — and it is why a fast scroll asks for a sparse film
      // instead of drowning in a dense one it cannot receive.
      passRate = Math.abs(vel) * count * 60;

      // Same ramps as the captions, on the same progress value, so a stamp and
      // a caption never drift apart by a frame.
      beatRefs.current.forEach((el, k) => {
        const beat = applyBeats[k];
        if (!el || !beat) return;
        const [a, b] = beat.at;
        const fadeIn = smooth(p, a, a + 0.035);
        const fadeOut = 1 - smooth(p, b - 0.035, b);
        const o = Math.min(fadeIn, fadeOut);
        el.style.opacity = String(o);
        // Overshoot on the way in: past 1 at 0.7 of the ramp, settling back.
        // A stamp that arrives at exactly its final size looks placed; one
        // that overshoots looks thrown.
        const pop = fadeIn < 1 ? 0.86 + fadeIn * 0.19 : 1;
        el.style.transform =
          `translate3d(0, ${(1 - fadeIn) * 26}px, 0) scale(${pop}) rotate(${lean * -2.5}deg)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      });

      // The seal is the one element that proves the film is being scrubbed by
      // the visitor rather than played on a clock: its rotation IS the scroll
      // position. Push forward and it turns; drag back and it unwinds.
      sealRefs.current.forEach((el) => {
        if (el) el.style.transform = `rotate(${p * 900}deg)`;
      });

      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (cue.current) cue.current.style.opacity = String(1 - smooth(p, 0, 0.04));

      // ---- the ending ----------------------------------------------------
      // The film's last cut is at .9058 and the frames stop mid-stride, which
      // left the closing fourteen percent of the scroll painting one identical
      // picture while the closing card faded in on top of it. A frozen frame
      // is not an ending; it is the film running out.
      //
      // So the tail gets its own move, on the same scrub as everything else.
      // The frame stops being footage and becomes a photograph: it pushes in,
      // the colour leaves it, a hairline frame draws around it, and a dark
      // plate closes over it with the wordmark cut OUT of the plate, so the
      // still is visible THROUGH the letters and nowhere else. The letters
      // then fill solid and the ask arrives underneath.
      //
      // Two ramps, overlapping rather than queued, for the reason the masthead
      // overlaps at the other end of the film: five moves in sequence take
      // longer than the scroll has, and the ending has to be finished and held
      // before the section lets go, not still arriving as it leaves.
      const cut = smooth(p, 0.906, 0.962);
      const fill = smooth(p, 0.955, 0.988);
      const nextPush = 1 + cut * 0.05;
      if (nextPush !== push) {
        push = nextPush;
        // The playhead is parked on the film's last frame for the whole of
        // this, so `idx` never changes and the loop would never redraw. The
        // push is the one thing here that needs the canvas re-rasterised;
        // flagging it only on a change keeps the other ninety percent of the
        // film on one draw per frame CHANGE rather than one per frame.
        dirty = true;
      }
      // Written on the STAGE rather than on the closing layer, because the
      // film's own scrims have to answer to the same ramp: they exist to keep
      // caption type readable over a moving picture, and during the ending the
      // picture inside the letterforms has to be the brightest thing on the
      // screen. Scrimmed as usual it is a fifth of its own brightness and the
      // cut reads as a smudge.
      if (stage.current) {
        stage.current.style.setProperty("--end-cut", String(cut));
        stage.current.style.setProperty("--end-fill", String(fill));
      }
      // Saturation is the half of "this is now a photograph" that a plate
      // cannot do. Written on the canvas element rather than composited as an
      // extra layer, and only while the ending is running, so no frame of the
      // film before .906 pays for a filter pass.
      //
      // Composed with the blur `paint` asked for rather than assigned over it.
      // Two writers on one property is how the ending used to erase the
      // dissolve blur every frame it ran; one writer, both inputs, no ordering
      // to get wrong. Both halves are skipped entirely when neither is active,
      // so the ordinary case still pays for no filter at all.
      const sat = cut > 0.001 ? `saturate(${1 - cut * 0.4})` : "";
      const blur = frameBlur > 0.05 ? `blur(${frameBlur.toFixed(2)}px)` : "";
      const filter = blur && sat ? `${blur} ${sat}` : blur || sat;
      if (filter !== lastFilter) {
        lastFilter = filter;
        cv.style.filter = filter;
      }
    };

    if (reduced) {
      // No scrubbing at all: load one frame, paint it, show the opening beat.
      //
      // Still behind the format probe, because `url` does not exist until a
      // tier has been chosen. Calling it before then returned the empty string,
      // which is a same-page request that always 200s and decodes to nothing.
      AVIF_OK.then((ok) => {
        if (disposed) return;
        chooseTiers(ok);
        started = true;
        const img = new window.Image();
        img.onload = () => {
          if (disposed) return;
          images[0] = img;
          tierOf[0] = displayTier;
          setPrimed(true);
          resize();
          paint(0);
        };
        img.src = url(displayTier, 0);
      });
      applyOverlay(0);
      return () => {
        disposed = true;
        window.removeEventListener("resize", resize);
        window.visualViewport?.removeEventListener("resize", resize);
      };
    }

    // ---- the loop --------------------------------------------------------
    // Progress is read straight off the layout box every frame. No easing, no
    // scrub, no lerp: one scroll position always maps to exactly one frame, so
    // scrolling up is the exact reverse of scrolling down.
    let raf = 0;
    let running = false;

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);

      const rect = sec.getBoundingClientRect();
      const total = rect.height - stageH;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;

      // The listeners above can miss the one case that matters most: a visitor
      // who flicks in the gap between the HTML arriving and this component
      // mounting, and then holds still. There is no scroll event left to hear,
      // but the film is plainly not at the top, which is the same evidence.
      if (!windowOpen && p > 0.001) open();

      // Straight from progress to a frame index. There is no longer a track
      // indirection in front of this: the phone used to be served every second
      // frame of a film built for desktop, and the portrait cut is now built
      // at the density a phone should have, so the sequence a device fetches
      // is decided once at build time rather than sampled again at runtime.
      const idx = Math.min(count - 1, Math.round(p * (count - 1)));

      if (idx !== lastDrawn || dirty) {
        lastDrawn = idx;
        dirty = false;
        paint(idx);
        // The window the loader fills travels with the playhead, so moving the
        // playhead is what gives it more to do. Only on a frame change: calling
        // this every rAF would re-scan the window sixty times a second to find
        // the same answer.
        cursor = idx;
        pump();
      }
      applyOverlay(p);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          raf = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px 0px" }
    );
    io.observe(sec);

    pump();

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      for (const g of GESTURES) window.removeEventListener(g, open);
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={section} id="tour" style={{ height: TOUR_HEIGHT }} className="relative bg-ink">
      <span id="top" aria-hidden className="absolute top-0" />

      {/* The page's one h1. It lives out here rather than inside a caption
          because captions are toggled to visibility:hidden as the film runs,
          which would pull the heading in and out of the accessibility tree. */}
      <h1 className="sr-only">
        {BRAND.group}, {BRAND.tagline}. JECRC University Jaipur, JECRC University Alwar NCR and JECRC
        Foundation.
      </h1>

      <div
        ref={stage}
        className="sticky top-0 h-dvh w-full overflow-hidden bg-ink"
        style={{ "--end-cut": "0", "--end-fill": "0" } as React.CSSProperties}
      >
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* The poster, OVER the canvas rather than under it, and faded out
            once there are real frames to show.

            It was underneath, which quietly made it useless. The 2D context is
            requested with `alpha: false` for the draw speed, and an opaque
            canvas is BLACK until something is drawn into it: sitting on top,
            it covered the poster completely, so the first thing anyone saw was
            a black rectangle and the first real picture was the first decoded
            frame. On a throttled phone that measured as 3.7s of LCP render
            delay against 20ms to fetch the poster itself. Over the top, the
            preloaded poster is the first paint, and the canvas cross-fades in
            underneath it once it has something. */}
        {/* One poster per shape, selected by the browser rather than by us.

            A <picture> with a media condition, not next/image and not a
            state-picked src: the orientation is not known during server render,
            and swapping the src after mount would fetch one poster, discard it,
            and fetch the other — on the LCP element, over the connection that
            is also trying to deliver the spine. The browser evaluates the
            media query before it makes any request, so exactly one is ever
            fetched, and the matching <link rel="preload" media> in layout.tsx
            has it in flight before this markup is even parsed.

            Plain <img> because `images.unoptimized` is set: next/image would
            add a component and its hydration around the same one request. */}
        <picture>
          <source media="(orientation: portrait)" srcSet={(portraitFilm as Film).poster} />
          <img
            src={(landscapeFilm as Film).poster}
            alt=""
            aria-hidden
            fetchPriority="high"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${primed ? "opacity-0" : "opacity-100"}`}
          />
        </picture>

        {/* Top and bottom falloff, then a centre scrim so caption type stays
            readable over any frame the film happens to be on. */}
        <div aria-hidden className="u-tour-scrim pointer-events-none absolute inset-0 bg-linear-to-b from-ink/80 via-ink/10 to-ink/85" />
        <div
          aria-hidden
          className="u-tour-scrim pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 48% at 50% 50%, rgba(8,8,10,0.66) 0%, rgba(8,8,10,0.3) 55%, rgba(8,8,10,0) 100%)",
          }}
        />

        {/* ---- the ending ----
            See "the ending" in applyOverlay above for why this exists, and
            "The ending" in globals.css for the ramps.

            The plate is one masked rect rather than a stack: a dark wash with
            the wordmark punched out of it, so the frozen frame shows through
            the letterforms and is dimmed everywhere else. One element does the
            grade AND the reveal, and because the hole is cut rather than
            drawn, the mark can never be brighter than the picture behind it.

            Set as type, not as the lockup artwork. `jecrc-lockup-mono.png` is
            a two-up lockup whose opaque pixels are 2.5% of the frame; a
            knockout through strokes that fine is mush at any size a viewport
            allows. The same construction the scratch band uses — the word over
            a letterspaced second line at roughly its width — has the mass a
            cut needs, and rhymes the two sections.

            `visibility` rather than a display toggle: the SVG holds a mask,
            and the browser keeps the rasterised mask alive across a
            visibility change but rebuilds it after a reflow. */}
        <div aria-hidden className="u-end pointer-events-none absolute inset-0">
          <span className="u-end-frame" />
          <svg className="u-end-svg" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              {/* White passes the plate, black cuts it. */}
              <mask id={cutId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                <g className="u-end-type">
                  <text className="u-end-word" x="50%" y="46%" fill="#000">
                    JECRC
                  </text>
                  <text className="u-end-sub" x="50%" y="46%" dy="1.15em" fill="#000">
                    UNIVERSITY
                  </text>
                </g>
              </mask>
              {/* The same shapes, inverted: white where the letters are. */}
              <mask id={liftId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#000" />
                <g className="u-end-type">
                  <text className="u-end-word" x="50%" y="46%" fill="#fff">
                    JECRC
                  </text>
                  <text className="u-end-sub" x="50%" y="46%" dy="1.15em" fill="#fff">
                    UNIVERSITY
                  </text>
                </g>
              </mask>
            </defs>
            <rect
              className="u-end-plate"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#08080a"
              mask={`url(#${cutId})`}
            />
            {/* A wash inside the letters and nowhere else.
                The cut alone is at the mercy of whatever the film happens to
                have stopped on: this one stops on a tree canopy, and a hole
                punched through a dark plate onto a darker canopy is a hole
                nobody can see. Lifting only the cut region makes the mark
                legible on any frame without ever hiding the picture in it. */}
            <rect
              className="u-end-lift"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#fdfcfa"
              mask={`url(#${liftId})`}
            />

            {/* The same letterforms, solid, arriving last. The cut is the
                trick; the fill is the mark actually being placed. */}
            <g className="u-end-type u-end-solid">
              <text className="u-end-word" x="50%" y="46%" fill="var(--color-crimson)">
                JECRC
              </text>
              <text
                className="u-end-sub"
                x="50%"
                y="46%"
                dy="1.15em"
                fill="var(--color-crimson)"
              >
                UNIVERSITY
              </text>
            </g>
          </svg>

          {/* The crest, beside the wordmark and at the wordmark's own height:
              the construction of the published lockup, which sets the mark to
              the left of the type rather than over it.

              The type is in SVG and the crest is not, so the two are centred
              against each other arithmetically rather than by a flex box. It
              costs one constant: "JECRC" and "UNIVERSITY" both set to 2.8x
              the word's font-size, which holds at every width because the font
              is fixed and both sizes are in vw. From that the group's total
              width is known, and the type and the crest each get half of the
              other's width as an offset. See "The ending" in globals.css. */}
          <Image
            src={LOGO.crestLarge}
            alt=""
            width={402}
            height={464}
            className="u-end-crest"
          />
        </div>

        <div className="pointer-events-none absolute inset-0">
          {captions.map((c, i) => {
            // A caption anchored at zero is on screen at load, and the crest
            // inside it is the page's largest paint. Rendering it hidden and
            // waiting for the first frame of the overlay loop to reveal it put
            // the whole of hydration in front of the LCP: measured at 3.7s of
            // pure render delay on a throttled phone, against 20ms to fetch
            // the image itself. So the opening beat ships visible, in exactly
            // the state `applyOverlay(0)` would have put it in, and the loop
            // takes over from there without moving anything.
            const open = c.at[0] <= 0;
            return (
            <div
              key={c.title}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className={`absolute inset-0 flex flex-col items-center px-6 text-center ${
                // The closing beat shares the screen with the mark, which owns
                // the middle. Centred, the two would print on top of each other.
                c.variant === "apply"
                  ? "justify-end pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))] sm:pb-28"
                  : "justify-center"
              }`}
              style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden" }}
            >
              {c.variant === "hero" && (
                // The frame the mark is placed into. Both rules start life on
                // the same centre line, so what draws out first reads as one
                // hairline; they only become two when the band opens. See
                // "The masthead" in globals.css for the sequence.
                <div className="u-masthead mb-8 w-[min(78vw,25rem)] md:w-120">
                  <span aria-hidden className="u-masthead-rule u-masthead-rule-top" />
                  <span aria-hidden className="u-masthead-rule u-masthead-rule-bottom" />
                  <Image
                    src={LOGO.lockupMono}
                    alt={`${BRAND.name} and JECRC Medical College Hospital and Research Centre`}
                    width={557}
                    height={258}
                    priority
                    // The published lockup sits on an opaque white plate, so a
                    // CSS invert would give a white rectangle. This is the keyed
                    // version from `npm run brand:mono`.
                    fetchPriority="high"
                    className="u-masthead-mark h-auto w-full drop-shadow-[0_2px_30px_rgba(0,0,0,0.55)]"
                  />
                </div>
              )}

              {/* The rule before the eyebrow is a caption's tick mark: it says
                  "a line of type is starting here", which is what a caption
                  arriving over moving film needs and what a closing card does
                  not. The ending has a mark above it doing that job already,
                  so the rule comes off and the line stands on its own tracking
                  instead, quieter and wider than a caption's. */}
              {c.eyebrow && (
                <span
                  className={
                    c.variant === "apply"
                      ? "u-eyebrow mb-5 block text-[0.66rem] tracking-[0.36em] text-white/65 sm:mb-6 sm:text-[0.72rem]"
                      : `u-eyebrow mb-5 inline-flex items-center gap-3 text-crimson-lit ${
                          c.variant === "hero" ? "u-masthead-eyebrow" : ""
                        }`
                  }
                >
                  {c.variant !== "apply" && <span aria-hidden className="h-px w-8 bg-crimson" />}
                  {c.eyebrow}
                </span>
              )}

              {/* The closing beat has no line of its own. The mark IS its
                  headline, and a display-sized question under a display-sized
                  wordmark is two headlines arguing about which one you read
                  first. `title` stays on the beat as its key and its label. */}
              {c.variant !== "apply" && (
                <p
                  aria-hidden={c.variant === "hero"}
                  className={
                    c.variant === "hero"
                      ? "u-masthead-line u-display text-[13vw] leading-[0.9] text-paper [text-shadow:0_2px_50px_rgba(0,0,0,0.55)] sm:text-[9vw] lg:text-[6vw]"
                      : "u-display max-w-[16ch] text-[10vw] leading-[0.98] text-paper [text-shadow:0_2px_44px_rgba(0,0,0,0.6)] sm:text-[7vw] lg:text-[4.6vw]"
                  }
                >
                  {c.variant === "hero" ? BRAND.tagline : c.title}
                </p>
              )}

              {c.sub && (
                <p className="mt-6 max-w-[46ch] text-[14px] leading-[1.85] text-paper/80 [text-shadow:0_1px_22px_rgba(0,0,0,0.65)] md:text-[15px]">
                  {c.sub}
                </p>
              )}

              {c.variant === "apply" && (
                <div className="pointer-events-auto mt-7 flex w-full max-w-2xl flex-col items-stretch gap-2.5 sm:mt-9 sm:flex-row sm:justify-center sm:gap-3">
                  {APPLY_LINKS.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-3 backdrop-blur-md transition-colors duration-300 hover:border-crimson hover:bg-crimson sm:px-6 sm:py-3.5"
                    >
                      <span className="u-eyebrow whitespace-nowrap text-paper">Apply · {link.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-paper/70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* ---- the ask, mid-film ----
            One anchor, three moments. An earlier pass alternated sides and
            heights so the stamp would feel alive; what it actually did was
            make the visitor re-find the only button on screen every time it
            came back. Pinned to the bottom gutter it is learned once and then
            simply expected, and the film keeps all the movement.

            Two shells rather than one flat card. The outer is a translucent
            white tray with a hairline; the inner is opaque brand red with a
            lit top edge, on a concentric radius. The tray is what lets it sit
            on a photograph at any exposure without either dissolving into a
            bright frame or turning into a floating slab on a dark one.

            No backdrop blur, deliberately: this sits over a canvas that
            repaints every scrolled frame, so a blur here would be recomputed
            hundreds of times a second on the exact device that can least
            afford it. */}
        {applyBeats.map((beat, i) => {
          const link = APPLY_LINKS[beat.campus % APPLY_LINKS.length];
          const ring = `${uid}-ring-${i}`;
          return (
            <div
              key={`${link.id}-${beat.at[0]}`}
              ref={(el) => {
                beatRefs.current[i] = el;
              }}
              // Full-width strip on a phone, gutter-aligned card from `sm` up.
              // The width is fixed rather than shrink-to-fit: three campus
              // names of three different lengths would otherwise resize the
              // card on every appearance, which reads as three controls.
              className="pointer-events-auto absolute bottom-[calc(2.25rem+env(safe-area-inset-bottom))] left-[max(var(--pad),env(safe-area-inset-left))] right-[max(var(--pad),env(safe-area-inset-right))] z-10 sm:bottom-16 sm:left-auto sm:w-86"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Apply"
                data-cursor-tone="crimson"
                className="group block rounded-[1.5rem] bg-white/10 p-1 ring-1 ring-white/20 sm:rounded-[1.75rem] sm:p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.16),0_14px_30px_-12px_rgba(0,0,0,0.45),0_40px_80px_-36px_rgba(0,0,0,0.6)] transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/16 hover:ring-white/35 active:scale-[0.98]"
              >
                <span className="flex items-center gap-3 rounded-[1.15rem] bg-crimson p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-crimson-deep sm:gap-4 sm:rounded-[1.375rem] sm:p-3 sm:py-3.5">
                  {/* The seal. Its rotation is the scroll position, so it is
                      the one element on screen that answers "am I driving
                      this?" the instant you move. */}
                  <span className="relative grid h-13 w-13 shrink-0 place-items-center sm:h-17 sm:w-17">
                    <svg
                      ref={(el) => {
                        sealRefs.current[i] = el;
                      }}
                      viewBox="0 0 100 100"
                      aria-hidden
                      className="absolute inset-0 h-full w-full"
                    >
                      <defs>
                        <path
                          id={ring}
                          d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                          fill="none"
                        />
                      </defs>
                      {/* Two repetitions, not three: at this radius a third
                          pass overruns the circumference and the words start
                          overprinting each other. */}
                      <text className="fill-paper text-[15px] font-bold uppercase tracking-[0.13em]">
                        <textPath href={`#${ring}`}>Apply now · Apply now ·</textPath>
                      </text>
                    </svg>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-paper" />
                  </span>

                  <span className="min-w-0">
                    <span className="u-eyebrow block text-paper/70">Admissions 2026</span>
                    <span className="u-grotesk mt-0.5 block truncate text-[1.1rem] leading-tight text-paper sm:text-[1.45rem]">
                      {link.label}
                    </span>
                  </span>

                  {/* The arrow gets its own enclosure flush with the inner
                      padding rather than floating beside the text, so the card
                      has an obvious place to aim at and somewhere to move when
                      you reach it. */}
                  <span
                    aria-hidden
                    className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 sm:h-11 sm:w-11 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 group-hover:bg-paper"
                  >
                    <ArrowUpRight className="h-4 w-4 text-paper transition sm:h-4.5 sm:w-4.5 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-crimson" />
                  </span>
                </span>
              </a>
            </div>
          );
        })}

        {/* Scroll cue, gone the moment the film starts moving. */}
        <div
          ref={cue}
          aria-hidden
          className="pointer-events-none absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 transition-opacity duration-500"
        >
          <span className="u-masthead-cue u-eyebrow text-white/50">Scroll</span>
          <span className="u-masthead-cue-line block h-10 w-px bg-linear-to-b from-white/50 to-transparent" />
        </div>

        {/* Loading readout, only while it matters. */}
        <div
          className={`pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
            primed ? "opacity-0" : "opacity-100"
          }`}
          role="status"
          aria-live="polite"
        >
          <span className="u-eyebrow text-white/45">Loading the tour, {pct}%</span>
        </div>

        {/* Playhead. */}
        <div
          aria-hidden
          className="u-masthead-track pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/12"
        >
          <span ref={bar} className="block h-px origin-left bg-crimson" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
