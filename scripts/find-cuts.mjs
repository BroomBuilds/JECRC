/**
 * Where the hard cuts are, given the frame-to-frame difference of a film.
 *
 * Split out of build-tour.mjs so it can be exercised without ffmpeg and
 * without a five-minute encode. `node scripts/find-cuts.mjs` runs the checks
 * at the bottom.
 *
 * Input is the mean luma difference between each pair of consecutive source
 * frames, on a 0-255 scale. Normal motion in this footage sits around 4; a cut
 * lands at 40-70.
 */

import { pathToFileURL } from "node:url";

const median = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[(s.length - 1) >> 1];
};

/**
 * @param {number[]} d      per-frame luma difference
 * @param {object}  [opt]
 * @param {number}  [opt.spike]  absolute floor; below this it is motion
 * @param {number}  [opt.ratio]  how far clear of its neighbourhood a cut stands
 * @param {number}  [opt.win]    frames either side that define "neighbourhood"
 * @returns {number[]} indices into `d` of the frames that begin a new shot
 *
 * A bare threshold does not work. The film this was written for contains a
 * fast dolly through foreground trees that holds a difference of ~23 for
 * forty-seven consecutive frames — far above any sane threshold, and not a cut
 * at all. What separates them is shape rather than height: a cut is an
 * ISOLATED SPIKE, sustained motion is a PLATEAU.
 *
 * Each side gets its own baseline and the SMALLER of the two decides. A single
 * median over the whole window is wrong at exactly the frames being looked
 * for: a cut sits on a shot boundary, so half its window belongs to the
 * outgoing shot and half to the incoming one, and when one of those is the
 * dolly that window is bimodal and its median lands in the high group. The
 * first frame of the dolly measured 61 against a whole-window median of 22 and
 * was discarded as motion — the film shipped with nine of its eleven cuts
 * found. Taking the minimum of the two sides says what is actually meant: a
 * cut stands clear of at least ONE of the shots it joins, while sustained
 * motion stands clear of neither.
 */
export function findCuts(d, opt = {}) {
  const { spike = 25, ratio = 3, win = 8 } = opt;
  const n = d.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    if (d[i] <= spike) continue;
    const before = d.slice(Math.max(0, i - win), i);
    const after = d.slice(i + 1, Math.min(n, i + 1 + win));
    const base = Math.max(0.5, Math.min(median(before), median(after)));
    if (d[i] / base < ratio) continue;
    out.push(i);
  }
  return out;
}

// ---------------------------------------------------------------------------

// `pathToFileURL` rather than string-building the URL: on Windows argv[1] is
// a backslashed drive path and import.meta.url is file:///C:/…, so any
// hand-rolled comparison silently never matches and the checks never run.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const assert = (name, cond) => {
    if (!cond) {
      console.error(`✗ ${name}`);
      process.exitCode = 1;
    } else console.log(`✓ ${name}`);
  };

  const noise = (n, level) => Array.from({ length: n }, () => level + Math.random() * 2);

  // A cut in the middle of quiet footage.
  {
    const d = [...noise(20, 4), 55, ...noise(20, 4)];
    assert("finds an isolated spike", JSON.stringify(findCuts(d)) === "[20]");
  }

  // The case that shipped broken: a cut INTO a sustained high-motion run, and
  // another cut back OUT of it. Both boundaries are real; none of the plateau
  // between them is.
  {
    const d = [...noise(20, 4), 61, ...noise(47, 22), 52, ...noise(20, 4)];
    const cuts = findCuts(d);
    assert("finds the cut entering a high-motion run", cuts.includes(20));
    assert("finds the cut leaving a high-motion run", cuts.includes(68));
    assert("rejects all 47 plateau frames", cuts.length === 2);
  }

  // Fast motion that never cuts must yield nothing at all, or every dolly in
  // the film becomes a dissolve.
  {
    assert("rejects a plateau with no cut in it", findCuts(noise(60, 23)).length === 0);
  }

  // A cut in the first or last few frames still has only one usable side.
  {
    assert("finds a cut near the start", findCuts([...noise(3, 4), 60, ...noise(20, 4)]).includes(3));
    assert("finds a cut near the end", findCuts([...noise(20, 4), 60, ...noise(3, 4)]).includes(20));
  }

  // A film with no cuts at all is a legitimate input — the ideal one, in fact.
  {
    assert("finds nothing in a continuous take", findCuts(noise(200, 5)).length === 0);
  }

  if (!process.exitCode) console.log("\nall cut-detection checks passed");
}
