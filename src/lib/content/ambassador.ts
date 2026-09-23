/**
 * The Vikrant Massey band.
 *
 * `portrait` is optional: the section renders a branded frame when it is
 * unset, so pulling the image never leaves a hole.
 */
export const AMBASSADOR = {
  /** The two header lines, in order. */
  title: "A New Chapter Begins",
  subtitle: "Welcome to the JECRC Family",
  name: "Vikrant Massey",
  /** Read only by the SEO graph, which dates the Person node. */
  announced: "April 2026",
  /** JECRC's own campaign photograph. Replace with the master when it arrives. */
  portrait: "/brand/vikrant-massey.webp" as string | undefined,
  portraitAlt: "Vikrant Massey at JECRC University",
  /**
   * A 16x20 crop of the portrait, inline, about 250 bytes, so the band arrives
   * as a soft version of the photograph rather than an empty box that pops.
   * Regenerate alongside the portrait:
   *   sharp(file).resize(16, 20, { fit: "cover" }).webp({ quality: 45 })
   */
  portraitBlur:
    "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoQABQAPt1apkyopSOiMAgBEBuJZACdMoMzGCG3t6teRIl6RGwAANsJywIPi1KCdl8cUpGWfPhtxfgNxk+VpPp4L/IOtboasu/R78mg8OF8zlcM6euB+pJACVBioOW6ldksbDcFeuex3Qg+cw+fvEiOvKh5i5Rk4PE1lwSk17L23MRGHGpvy9FfiqtkGIjoBFZqwAAA",
  /** The group's copy, verbatim. */
  body: [
    "From ordinary beginnings to extraordinary journeys, Vikrant Massey's story reflects the spirit we nurture at JECRC — to dream big, stay authentic, and keep moving forward.",
    "Known for his versatility, authenticity and powerful storytelling, Vikrant joins the JECRC Group of Institutions as its new face, inspiring a new generation to believe in their stories and bring them to life.",
    "At JECRC, we believe every student has a story waiting to unfold. And this new chapter is about inspiring many more of them.",
  ],
  signoff: "Come, Build Your World with Us.",
  /** `watchVideoId` drives the in-page player; `watchHref` is the YouTube fallback. */
  watchVideoId: "5JrMq6z2tNg",
  watchHref: "https://www.youtube.com/watch?v=5JrMq6z2tNg",
  watchLabel: "Watch the announcement",
  watchTitle: "JECRC welcomes Vikrant Massey",
} as const;
