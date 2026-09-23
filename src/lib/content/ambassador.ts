/**
 * A new chapter begins.
 *
 * The section used to be built as a brand-ambassador card: an eyebrow reading
 * "Brand ambassador", a role line, a pull quote the university had not
 * attributed to anyone, and three notes (announced, represents, campaign). All
 * of it is gone. What is here now is the copy the group supplied, and nothing
 * that was written around it.
 *
 * `portrait` stays optional: the section renders a branded frame when it is
 * unset, so pulling the image never leaves a hole. The one in place is JECRC's
 * own published campaign photograph, not a press agency frame.
 */
export const AMBASSADOR = {
  /** The two header lines, in order. */
  title: "A New Chapter Begins",
  subtitle: "Welcome to the JECRC Family",
  name: "Vikrant Massey",
  /**
   * Kept for the SEO graph, which dates the Person node. Nothing on the page
   * reads it any more — the "Announced / Represents / Campaign" notes that
   * used to are gone with the rest of the ambassador furniture.
   */
  announced: "April 2026",
  /**
   * Published by JECRC on their own application portal
   * (jecrcuapplication.jecrcuniversity.edu.in), shot on the Sitapura campus.
   * Replace with the campaign master when the shoot assets arrive.
   */
  portrait: "/brand/vikrant-massey.webp" as string | undefined,
  portraitAlt: "Vikrant Massey at JECRC University",
  /**
   * A 16 by 20 crop of the portrait itself, inline, about 250 bytes.
   *
   * It stands in the frame until the real file lands, so the band arrives as a
   * soft version of the photograph rather than as an empty box that pops. The
   * preload below means it is rarely on screen for long — but the visitor who
   * scrolls fastest is exactly the one who would otherwise see nothing at all,
   * and the one this is for.
   *
   * Regenerate alongside the portrait:
   *   sharp(file).resize(16, 20, { fit: "cover" }).webp({ quality: 45 })
   */
  portraitBlur:
    "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASoQABQAPt1apkyopSOiMAgBEBuJZACdMoMzGCG3t6teRIl6RGwAANsJywIPi1KCdl8cUpGWfPhtxfgNxk+VpPp4L/IOtboasu/R78mg8OF8zlcM6euB+pJACVBioOW6ldksbDcFeuex3Qg+cw+fvEiOvKh5i5Rk4PE1lwSk17L23MRGHGpvy9FfiqtkGIjoBFZqwAAA",
  /**
   * The group's copy, verbatim, as four paragraphs. The last is the sign-off
   * and is set apart on the page.
   */
  body: [
    "From ordinary beginnings to extraordinary journeys, Vikrant Massey's story reflects the spirit we nurture at JECRC — to dream big, stay authentic, and keep moving forward.",
    "Known for his versatility, authenticity and powerful storytelling, Vikrant joins the JECRC Group of Institutions as its new face, inspiring a new generation to believe in their stories and bring them to life.",
    "At JECRC, we believe every student has a story waiting to unfold. And this new chapter is about inspiring many more of them.",
  ],
  signoff: "Come, Build Your World with Us.",
  /** JECRC's own upload. `watchVideoId` drives the in-page player; `watchHref`
      is the escape hatch for anyone who would rather watch it on YouTube. */
  watchVideoId: "5JrMq6z2tNg",
  watchHref: "https://www.youtube.com/watch?v=5JrMq6z2tNg",
  watchLabel: "Watch the announcement",
  watchTitle: "JECRC welcomes Vikrant Massey",
} as const;
