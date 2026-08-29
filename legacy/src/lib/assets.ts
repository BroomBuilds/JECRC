/**
 * Section imagery.
 *
 * `STILL.*` are frames lifted from the tour film itself by `npm run tour:build`
 * (see --stills), so the whole page is dressed from one source and restyles
 * automatically when you swap the video.
 *
 * `IMG.*` are Pexels photographs (free to use, no attribution required) used
 * where the film has no equivalent shot — the school cards. Replace with real
 * JECRC photography before launch.
 */

const m = (f: string) => `/media/${f}`;
const s = (n: number) => `/media/stills/s${n}.jpg`;

export const STILL = {
  one: s(1), two: s(2), three: s(3), four: s(4),
  five: s(5), six: s(6), seven: s(7), eight: s(8),
} as const;

export const IMG = {
  engineering: m("school-engineering.jpg"),
  electronics: m("school-electronics.jpg"),
  computing: m("school-computing.jpg"),
  lecture: m("school-lecture.jpg"),
  robotics: m("school-robotics.jpg"),
  sciences: m("school-sciences.jpg"),
  library: m("facility-library.jpg"),
} as const;
