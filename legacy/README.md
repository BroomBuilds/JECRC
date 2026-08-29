# Snoozed: v1 landing page

Frozen copy of the first JECRC landing build (the "Royal Palace re-skin"), kept as a
reference while v2 is built. Nothing in here is compiled: `legacy/` is excluded from
`tsconfig.json`, `eslint.config.mjs` and the Next.js route tree.

Contains `src/` as it stood at commit `fc7e594`, plus the `next.config.ts` and `TOUR.md`
of that build. The scroll-tour engine (`src/components/ScrollTour.tsx`) and the frame
build script (`scripts/build-tour.mjs`) were carried forward into v2, so those two are
the only files here that still have a live descendant.

Delete this folder once v2 is signed off.
