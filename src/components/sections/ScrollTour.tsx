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
 * Set in CSS rather than here so it can differ by screen: seventeen screens on
 * a desktop, and the same number on a 780px phone would be a wall the visitor
 * has to climb before reaching anything else. See `--tour-vh` in globals.css.
 * The last TOUR_TAIL of it is the ending's hold, not film.
 */
export const TOUR_HEIGHT = "var(--tour-vh)";

/**
 * The share of the tour's scroll spent holding the finished ending.
 *
 * The film, the captions and the ending's own choreography all complete at
 * `1 - TOUR_TAIL`; the rest is a hold on the last frame with the closing plate
 * fully formed. Without it the ending finished on the very last pixel of the
 * section and the page moved on the instant it arrived — you never got to look
 * at the thing the whole film was building to.
 *
 * `--tour-vh` in globals.css is sized so the FILM keeps the same scroll
 * distance it had before this existed (the old heights divided by
 * `1 - TOUR_TAIL`), which is why those numbers are not round. The tail is
 * added on top rather than taken out of the film.
 */
const TOUR_TAIL = 0.06;

/** One destination on a chapter card. */
export type Action = { label: string; href: string };

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
  /**
   * "hero" opens on the group mark, "chapter" is one institution, "group"
   * closes on the shared identity. The film is one chronological story —
   * 2001, 2012, 2026, 2026 — and the chapters are the middle of it.
   */
  variant?: "hero" | "chapter" | "group";
  /** Used as the React key and the accessible label for every variant. */
  title: string;

  // ---- group (the closing beat) ----
  /** The one line above the three portals. Not used by "hero" any more —
      that frame's headline is fixed ("JECRC" / "Group of institutions"),
      set directly in the component rather than passed through content. */
  thought?: string;

  // ---- chapter ----
  /** "01" … "04". Printed beside the title, not as a list marker. */
  no?: string;
  /** "Established 2001", "Launched 2026". Sits under the title, left column. */
  status?: string;
  /**
   * A reversed logo for this institution, printed straight onto the film.
   *
   * Reversed, not full-colour on a plate. The first pass stood the published
   * mark on a white rectangle to guarantee contrast, and the rectangle was the
   * only thing on screen that read as pasted over the picture rather than part
   * of it — every other element on a chapter card is type printed directly on
   * the film. `npm run brand:hospital` makes the reversed artwork; see that
   * script for how the three ink regions are handled.
   */
  mark?: { src: string; alt: string; width: number; height: number };
  /** The one supporting line, right column. Most chapters have none. */
  descriptor?: string;
  /** Right column, under the descriptor. */
  actions?: Action[];
};

type Props = { captions?: Caption[] };

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
 * The order of the apply portals on the closing frame.
 *
 * Chronological, so the three buttons repeat the order the film just put them
 * in: the college the group grew out of, then Jaipur, then Alwar NCR. The
 * navigation's order is a different question — there the flagship leads, which
 * is why `APPLY_LINKS` is left as it is and re-ordered here rather than at
 * the source.
 *
 * A rank rather than an index lookup: an id that is not in this list sorts to
 * the end instead of throwing, so adding a fifth institution shows it rather
 * than breaking the ending.
 */
const CLOSING_ORDER = ["foundation", "jaipur", "ncr"];
const CLOSING_PORTALS = [...APPLY_LINKS].sort((a, b) => {
  const rank = (id: string) => {
    const i = CLOSING_ORDER.indexOf(id);
    return i < 0 ? CLOSING_ORDER.length : i;
  };
  return rank(a.id) - rank(b.id);
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
export default function ScrollTour({ captions = [] }: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
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

      // The same smoothed velocity the stamp leans on, restated as the thing
      // the loader needs: frames of film passing under the playhead per
      // second. `vel` is progress per animation frame, so scaling by the frame
      // count and by 60 gives frames per second directly. This is half of the
      // fetch stride — the other half is how fast the connection is actually
      // delivering — and it is why a fast scroll asks for a sparse film
      // instead of drowning in a dense one it cannot receive.
      passRate = Math.abs(vel) * count * 60;

      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (cue.current) cue.current.style.opacity = String(1 - smooth(p, 0, 0.04));

      // ---- the opening plate ----------------------------------------------
      // Held solid for the first slice of the scroll so the name is read on
      // black rather than glimpsed over a dissolve, then off by .055. The
      // opening beat carries a shortened ramp so it does not begin leaving
      // until .065, which puts the name at full strength on the picture for a
      // moment in between — without that gap the two moves overlap and the
      // reveal reads as the title fading rather than as the film arriving.
      if (stage.current) {
        stage.current.style.setProperty("--open-plate", String(1 - smooth(p, 0.012, 0.055)));
      }

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
      // `applyOverlay(0)` leaves the opening plate solid, which is right for a
      // film that is about to be scrubbed and wrong for one that never will
      // be: there is no scroll here to dissolve it, so the visitor would hold
      // a black rectangle for the whole section. The name still lands on the
      // frame, just without the reveal.
      stage.current?.style.setProperty("--open-plate", "0");
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
      const scrolled = total > 0 ? clamp01(-rect.top / total) : 0;
      // Everything downstream — frame index, captions, the ending's ramps —
      // reads this rather than the raw scroll fraction, so all of it finishes
      // at `1 - TOUR_TAIL` and then holds. One line, and the hold applies to
      // the film and the choreography together rather than needing each to
      // know about it.
      const p = clamp01(scrolled / (1 - TOUR_TAIL));

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

        {/* A light top and bottom falloff, and nothing else.

            The centre scrim that used to sit here has gone. It was a radial at
            50% 50%, sized for captions centred in the frame, and it spent its
            density on the middle of the picture while the content — now a
            left/right grid in the lower third — sat in the transparent band
            between the two falloffs. Each card brings its own ground now
            (`u-plinth`, `u-vignette`), which means the ground fades in and out
            with the words it exists for instead of being on the whole time. */}
        <div
          aria-hidden
          className="u-tour-scrim pointer-events-none absolute inset-0 bg-linear-to-b from-ink/55 via-transparent to-ink/40"
        />

        {/* ---- the opening plate ----
            The tour does not begin as a picture. At the top it is black with
            the group's name on it, and the first scroll dissolves the plate off
            a film that has been running underneath the whole time — so the name
            arrives first and the picture is what it opens onto, rather than the
            name being a caption laid over a frame the visitor has already seen.

            Opaque by default rather than raised by script: the plate has to BE
            the first paint, and anything that fades it in is a flash of film
            before the black. `applyOverlay` takes `--open-plate` over from
            here on the first frame it runs.

            Over the scrim, under the captions and under the ending. The scrim
            exists to keep type readable over a moving picture and there is no
            picture to be read over yet; the captions are the point of the
            plate; and the two plates never run at the same end of the film. */}
        <div aria-hidden className="u-tour-open pointer-events-none absolute inset-0 bg-ink" />

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
          {/* The closing mark is the foundation's, not the university's.

              It is the same artwork three times over, because the ending does
              three things to it: cuts it out of the plate, glows through the
              hole, then fills it solid. The two-line Cinzel wordmark that used
              to do this was SVG <text>, which could be recoloured per copy for
              free; a raster cannot, so `npm run brand:foundation` (and the
              same script with `--ink`) writes the three it needs — black to be
              a luminance mask, white to light the hole, brand red to settle in.

              Sizing is `preserveAspectRatio="xMidYMid meet"` inside a
              percentage box rather than arithmetic: the mark fits the box and
              centres itself, so it is bounded by the frame's HEIGHT as well as
              its width without a single calc. The old lockup needed the
              arithmetic because the type and the crest were separate elements
              that had to be centred against each other; one image needs none
              of it. */}
          <svg className="u-end-svg" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              {/* White passes the plate, black cuts it. */}
              <mask id={cutId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#fff" />
                <image
                  href={LOGO.foundationMarkBlack}
                  className="u-end-mark"
                  x="6%"
                  y="16%"
                  width="88%"
                  height="42%"
                  preserveAspectRatio="xMidYMid meet"
                />
              </mask>
              {/* The same shape, inverted: white where the mark is. */}
              <mask id={liftId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="#000" />
                <image
                  href={LOGO.foundationMarkReversed}
                  className="u-end-mark"
                  x="6%"
                  y="16%"
                  width="88%"
                  height="42%"
                  preserveAspectRatio="xMidYMid meet"
                />
              </mask>
            </defs>

            {/* The plate, and the hole in it. */}
            <rect
              className="u-end-plate"
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="#08080a"
              mask={`url(#${cutId})`}
            />
            {/* A wash inside the mark and nowhere else.
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

            {/* The same shape, solid, arriving last. The cut is the trick; the
                fill is the mark actually being placed. */}
            <image
              className="u-end-solid u-end-mark"
              href={LOGO.foundationMark}
              x="6%"
              y="16%"
              width="88%"
              height="42%"
              preserveAspectRatio="xMidYMid meet"
            />
          </svg>
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
              // Index, not title. The beats are a fixed content array that is
              // never reordered or filtered, `capRefs` is already indexed the
              // same way, and two beats legitimately share a name: the film
              // opens and closes on the group identity.
              key={i}
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              className={`absolute inset-0 flex px-6 sm:px-10 lg:px-16 ${
                // The closing beat shares the screen with the mark, which owns
                // the middle. Centred, the two would print on top of each other.
                c.variant === "group"
                  ? "flex-col items-center justify-end pb-[max(6rem,calc(4.5rem+env(safe-area-inset-bottom)))] text-center sm:pb-28"
                  : c.variant === "hero"
                    ? "flex-col items-center justify-center text-center"
                    : // Bottom-anchored on a phone, vertically centred everywhere
                      // above it. The lower third was where this sat before —
                      // moved back to centre on request. `u-plinth` carries a
                      // matching sm+ override so the ground still sits behind
                      // the words wherever they land: see globals.css.
                      "items-end pb-[max(5rem,calc(3.5rem+env(safe-area-inset-bottom)))] sm:items-center sm:pb-0"
              }`}
              style={{ opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden" }}
            >
              {/* ---- the opening frame ----
                  The group mark, one sentence, and where the group is. That is
                  the whole of it. The tagline that used to sit here has gone:
                  it is already set inside the artwork, and repeating it at
                  display size underneath was the same words twice. */}
              {c.variant === "hero" && (
                <>
                  <span aria-hidden className="u-vignette" />
                  {/* The clean identity frame: the group's name, and nothing
                      else. The foundation mark that opened this has moved to
                      the closing frame, where it is the thing the whole film
                      arrives at rather than a badge introducing it — and the
                      opening is stronger for carrying one idea instead of two.

                      With the mark gone the masthead rules went with it: they
                      exist to frame artwork, and two hairlines around empty
                      space is furniture. */}
                  {/* Set in the wordmark's own face, not the interface sans.
                      `.u-wordmark` and `.u-wordmark-sub` are Cinzel at the two
                      weights and the two tracking values measured off the
                      published lockup — the same pair that sets "JECRC" over
                      "UNIVERSITY" in the artwork. Typesetting the group's name
                      in the UI face made it read as a caption about the brand
                      rather than as the brand, which is what the sans is for
                      and what the serif is not. */}
                  <p className="u-masthead-line u-wordmark u-onfilm-red relative text-[20.4vw] leading-[0.86] text-crimson-lit sm:text-[14.4vw] lg:text-[10.1vw]">
                    {BRAND.group}
                  </p>
                  <span className="u-wordmark-sub u-masthead-eyebrow u-onfilm-red relative mt-2 block text-[5.3vw] uppercase leading-none text-crimson-lit sm:mt-3 sm:text-[3.6vw] lg:text-[2.5vw]">
                    Group of institutions
                  </span>
                  {/* The one figure on the opening frame, and deliberately the
                      smallest thing on it: set in the interface sans rather
                      than the wordmark face, because it is a fact about the
                      group and not part of the lockup. It rises last, after
                      the name and the sub have placed themselves. */}
                  <span className="u-eyebrow u-masthead-stat u-onfilm relative mt-4 block text-[0.8125rem] text-paper/85 sm:mt-5 sm:text-[0.9rem] lg:text-[1rem]">
                    {BRAND.enrolled} Students Enrolled
                  </span>
                </>
              )}

              {/* ---- one institution ----
                  The same left/right grid for all four, so the film reads as
                  one continuous story with the content changing inside a frame
                  that does not. Title and year on the left, supporting line and
                  destinations on the right. Stacked below the `sm` breakpoint,
                  where there is no room for two columns and the portrait cut is
                  playing anyway. */}
              {c.variant === "chapter" && (
                <>
                <span aria-hidden className="u-plinth" />
                <div className="relative grid w-full max-w-[104rem] grid-cols-1 items-end gap-7 sm:grid-cols-12 sm:gap-10">
                  <div className="sm:col-span-7">
                    {c.mark && (
                      <Image
                        src={c.mark.src}
                        alt={c.mark.alt}
                        width={c.mark.width}
                        height={c.mark.height}
                        className="mb-5 h-10 w-auto drop-shadow-[0_1px_14px_rgba(0,0,0,0.55)] sm:mb-6 sm:h-11 lg:h-12"
                      />
                    )}
                    <span className="u-eyebrow u-onfilm mb-4 flex items-center gap-3 text-crimson-lit sm:mb-5">
                      {c.no}
                      <span aria-hidden className="h-px w-10 bg-crimson" />
                    </span>
                    <h2 className="u-display u-onfilm max-w-[18ch] text-[8.5vw] leading-[1.02] text-paper sm:text-[5.4vw] lg:text-[3.5vw]">
                      {c.title}
                    </h2>
                    {c.status && (
                      // Sized up from the base .u-eyebrow (13px/12px): a
                      // utility class in the utilities layer outranks the
                      // component class regardless of source order, so this
                      // overrides the font-size cleanly without touching the
                      // tracking, weight or transform every other eyebrow on
                      // the site relies on.
                      <span className="u-eyebrow u-onfilm mt-4 block text-[1rem] text-paper/85 sm:mt-5 sm:text-[1.05rem] lg:text-[1.15rem]">
                        {c.status}
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-5 sm:text-right">
                    {c.descriptor && (
                      <p className="u-onfilm mb-5 max-w-[34ch] text-[14px] leading-[1.7] text-paper sm:ml-auto sm:mb-6 md:text-[15px]">
                        {c.descriptor}
                      </p>
                    )}
                    {c.actions && (
                      <div className="pointer-events-auto flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
                        {c.actions.map((a, k) => {
                          // The last action is the one being asked for. On a
                          // chapter with two that is "Apply Now"; on the
                          // hospital, which has one, it is the only thing there
                          // and still deserves the weight.
                          const primary = k === c.actions!.length - 1;
                          return (
                            <a
                              key={a.label}
                              href={a.href}
                              {...(a.href.startsWith("#")
                                ? {}
                                : { target: "_blank", rel: "noopener noreferrer" })}
                              className={`group u-act ${primary ? "u-act-primary" : "u-act-secondary"}`}
                            >
                              <span className="u-eyebrow whitespace-nowrap text-paper">{a.label}</span>
                              <ArrowUpRight
                                className={`h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
                                  primary ? "text-paper" : "text-paper/75"
                                }`}
                              />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}

              {/* ---- the closing frame ----
                  The mark IS the headline here — it is cut out of the closing
                  plate by the ending's own choreography — so this beat adds one
                  quiet line above it and the three portals below. */}
              {c.variant === "group" && (
                <>
                  {/* No vignette here, unlike the opening frame.

                      The ending builds its own ground: a dark plate closes over
                      the film with the wordmark cut OUT of it, so the picture
                      inside the letterforms is meant to be the brightest thing
                      on screen. A scrim over the top of that darkens exactly
                      the letters it is supposed to reveal — added one here and
                      the mark all but disappeared. The film's own scrims fade
                      out on `--end-cut` for the same reason. */}
                  {c.thought && (
                    // A sentence, so it is set as one: sentence case, normal
                    // tracking, a measure it can breathe in. The uppercase
                    // tracked Cinzel that was briefly here suited a three-word
                    // slogan and would turn a full sentence into a banner.
                    <p className="u-onfilm relative mx-auto mb-6 block max-w-[30ch] text-balance text-[1rem] leading-[1.5] text-paper/90 sm:mb-7 sm:max-w-[42ch] sm:text-[1.15rem]">
                      {c.thought}
                    </p>
                  )}
                  <div className="pointer-events-auto relative mt-7 flex w-full max-w-2xl flex-col items-stretch gap-2.5 sm:mt-9 sm:flex-row sm:justify-center sm:gap-3">
                    {CLOSING_PORTALS.map((link) => (
                      <a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group u-act u-act-secondary"
                      >
                        <span className="u-eyebrow whitespace-nowrap text-paper">Apply · {link.label}</span>
                        <ArrowUpRight className="h-4 w-4 text-paper/75 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
            );
          })}
        </div>

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
