# School photographs

One picture per school, shown on hover in the "Find your programme" band.
`src/lib/content/schools.ts` points at `/media/schools/<slug>.webp` and nothing
else, so the encoded file here is the only thing the site knows about.

## Where they come from

Ten of the eleven are the group's own artwork, supplied in `ref/images`. The
map from those filenames to these slugs lives in `SCHOOL_PHOTOS` in
`scripts/optimize-media.mjs` — that map is the record of which picture belongs
to which school, because the supplied names have spaces in them and do not
match the slugs.

`ref/` is gitignored, the same as the films the scroll tour is built from: the
sources are working assets, and the encoded `.webp` in this folder is what
ships and what is committed. Keep the originals somewhere outside the repo.

| Slug | Source in `ref/images` |
| --- | --- |
| `engineering-technology` | `engineering and tech.jpg` |
| `computer-applications` | `computer applications.avif` |
| `business` | `business.avif` |
| `sciences` | `sciences.avif` |
| `humanities-social-sciences` | `humanities.avif` |
| `law` | `law.avif` |
| `mass-communication` | `mass com.avif` |
| `design` | `design.avif` |
| `allied-health-sciences` | `applied health.avif` |
| `hospitality` | `hospitality.avif` |

**`economics` is the exception.** No source was supplied for it, so it keeps
the CC0 photograph it already had — market charts on a screen, from
Rawpixel's public-domain set:
<https://www.rawpixel.com/image/5916235/photo-image-public-domain-office-free>.
CC0 is a waiver, not a licence: commercial use, no attribution, no
share-alike. Drop `economics.<ext>` into `ref/images`, add the line to
`SCHOOL_PHOTOS`, and it is replaced like any other.

## Adding or replacing one

Put the file in `ref/images`, make sure `SCHOOL_PHOTOS` maps its name to the
right slug, then:

```
npm run media
```

It encodes to WebP at up to 1024px on the long edge and writes `<slug>.webp`
here. A source that is missing is skipped rather than failing, so a school
whose photograph has not arrived keeps the one it has.

JPEG, PNG and AVIF all work as sources — most of the supplied set is AVIF.

## What to look for

**Portrait, ideally 2:3 or 3:4.** The frame crops to 3:4 portrait and is about
512 CSS pixels wide, so 1024 × 1365 covers it at DPR 2. Most of the supplied
set is 687 × 1031, which is a little under that and encoded at its own size
rather than upscaled — not a difference you can see at this size, but anything
sourced larger later is a straight improvement.

A landscape source still works — `law` is 3:2 — but it loses its left and
right thirds to the crop, so the subject has to be centred.

Prefer people doing the thing over empty rooms, and daylight over flash. Avoid
legible signage, visible third-party logos, and anything with a date-stamped
look.

Photographs of JECRC's own campus beat any stock — real students in the real
labs, studios and kitchens is the thing stock cannot buy.
