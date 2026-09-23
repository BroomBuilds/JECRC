"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MOBILE_NAV, PRIMARY, UTILITY, type NavItem } from "@/lib/content/navigation";
import { LOGO, SOCIAL } from "@/lib/content/site";
import { useTourComplete } from "@/lib/hooks/useTourComplete";
import { cn } from "@/lib/utils/cn";
import ApplyMenu from "@/components/ui/ApplyMenu";
import { SOCIAL_ICONS } from "@/components/ui/Icons";
import ScrollTopButton from "@/components/ui/ScrollTopButton";

/**
 * The navigation, from jecrcuniversity.edu.in and cut down to what one page
 * needs.
 *
 * The anatomy is theirs: a red utility strip over a white primary strip, with
 * the crest on a white plate hanging through the seam between them. The plate
 * is drawn rather than photographed, so it stays crisp at any density — see
 * the block above `PLATE` for its geometry and why the V starts where it
 * does.
 *
 * The contents are not theirs. Their bar carries a full site's menu; this
 * fronts one page, so it carries the social marks, three in-page jumps and the
 * apply button, and nothing else. A directory belongs in the footer.
 *
 * It does not exist while the scroll tour is playing: the film gets a clean
 * frame, and the bar drops in on the beat the tour ends.
 */

/**
 * ---- the crest plate ----
 *
 * A white plate with a crimson edge, hanging through the seam between the two
 * strips. Back to that after a crimson-pendant version, which read well on its
 * own and read as a red slab sitting in the middle of the bar.
 *
 * ---- where the sides end ----
 *
 * This is the part every earlier version got wrong, and it is the only thing
 * that makes the shape look considered rather than clipped.
 *
 * The straight sides run the WHOLE height of the bar. `shoulder` is the bar's
 * own height, so the plate's flanks stop exactly on the white strip's bottom
 * edge, and the V is the part that hangs below into the page. The plate
 * therefore has two jobs in two places: above the seam it is a panel flush
 * with the chrome, below it a pendant. Earlier versions started the V about
 * two thirds of the way up, which put a taper inside the bar — the eye reads
 * that as the plate being cut off by the strip rather than passing through it.
 *
 * Because the flanks are the bar's height, the bar's height is also the
 * mark's budget: `STRIP_PRIMARY` is back to 56, which gives a 98px bar and a
 * 78px mark with 10px of air above and below it.
 *
 * ---- the edge ----
 *
 * One crimson hairline round the silhouette, no fill tricks and no inner
 * rule. Where the plate crosses the red utility strip the stroke is crimson on
 * crimson and vanishes; below the seam it reads on white. One property, and
 * the plate looks cut out of the band rather than laid on top of it.
 *
 * Drawn as an inline SVG rather than a `clip-path` for exactly that: a clip
 * has no edge to stroke. The shadow is a `drop-shadow` filter so it follows
 * the V instead of the element's rectangle, and it is warm — the page's blacks
 * all carry a red cast, and a neutral grey shadow under a crimson band reads
 * as dirt.
 */
const STRIP_UTILITY = 42;
const STRIP_PRIMARY = 56;

/** The bar, and so the height of the plate's straight sides. */
const BAR_H = STRIP_UTILITY + STRIP_PRIMARY;

const PLATE = {
  w: 268,
  /** How far the V hangs below the bar. */
  drop: 34,
  /** The lockup's height. 2.365:1, so this is 184px across. */
  mark: 78,
  /**
   * Top of the mark.
   *
   * Centred on the SILHOUETTE's centre of area, not on the bar. Centred in the
   * bar the mark sat 10px from the top and 44px from the point, which is what
   * made it read as riding high in its own plate: the eye weighs the whole
   * shape, and a third of that shape is below the seam.
   *
   * The flanks contribute 268x98 about their midpoint at 49, the V roughly
   * 55% of 268x34 about a point near 112, which puts the centre of area at
   * 59 and the mark's top at 59 - 78/2 = 20. It crosses the seam by a hair
   * and that is invisible — the plate is one continuous white shape, and the
   * bar's crimson rule passes behind it rather than across it.
   */
  markTop: 20,
};

/**
 * The silhouette: straight flanks for the full bar, then the V.
 *
 * The 6px flat at the bottom centre is what keeps the point *soft*. A true
 * point at this scale renders as one hard pixel and catches the eye as a
 * defect, and rounding it with a curve instead makes the whole base read as a
 * bowl. Coordinates are inset half a pixel so the 1px stroke is not clipped by
 * the viewBox at the flanks.
 */
const PLATE_H = BAR_H + PLATE.drop;
const PLATE_PATH =
  `M0.5,0 H${PLATE.w - 0.5} V${BAR_H} ` +
  `C${PLATE.w - 0.5},${BAR_H + 9} ${PLATE.w - 78},${PLATE_H - 7} ${PLATE.w / 2 + 3},${PLATE_H} ` +
  `L${PLATE.w / 2 - 3},${PLATE_H} ` +
  `C78,${PLATE_H - 7} 0.5,${BAR_H + 9} 0.5,${BAR_H} Z`;

/**
 * The chrome runs wider and with tighter gutters than the editorial shell, the
 * way the live navbar does. Three grid columns rather than flex with a spacer:
 * two `minmax(0, 1fr)` tracks are always equal, so the fixed centre column sits
 * exactly on the viewport centre and the crest can never drift onto a link.
 */
const BAR =
  "mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_340px_minmax(0,1fr)] items-center px-[max(1.25rem,env(safe-area-inset-left))] md:px-8 lg:px-6 2xl:px-10";

/** Mobile has no centre column: the lockup lives in the bar itself. */
const BAR_MOBILE =
  "mx-auto flex w-full max-w-[1800px] items-center justify-between px-[max(1.25rem,env(safe-area-inset-left))] md:px-8";

const rel = (item: NavItem) =>
  item.external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

function SocialRow({ tone }: { tone: "light" | "dark" }) {
  // Negative margin so the 44px hit areas do not push the row wider than the
  // marks look. The icon keeps its size; only the target around it grows.
  return (
    <ul className="-mx-1.5 flex items-center">
      {SOCIAL.map((s) => {
        const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
        return (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${s.label}, opens in a new tab`}
              className={cn(
                "flex h-11 w-11 items-center justify-center transition-colors duration-300",
                tone === "light"
                  ? "text-white/85 hover:text-white"
                  : "text-quiet hover:text-crimson"
              )}
            >
              <Icon className="h-4.5 w-4.5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function Navbar() {
  const revealed = useTourComplete("tour");
  const [open, setOpen] = useState(false);

  // A drawer left open behind a resize into the desktop layout leaves the page
  // scroll-locked with nothing on screen to close.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const mq = window.matchMedia("(min-width: 1024px)");
    const close = () => setOpen(false);
    mq.addEventListener("change", close);
    return () => {
      document.documentElement.style.overflow = "";
      mq.removeEventListener("change", close);
    };
  }, [open]);

  return (
    <header
      // `inert` keeps the whole bar out of the tab order until it is on screen.
      inert={!revealed}
      aria-hidden={!revealed}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-[900ms] ease-out-expo",
        revealed ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      {/* ---- red utility strip (desktop) ---- */}
      <div className="hidden bg-crimson lg:block">
        <div className={BAR} style={{ height: STRIP_UTILITY }}>
          <nav aria-label="The group" className="flex items-center gap-6">
            {UTILITY.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...rel(item)}
                style={{ height: STRIP_UTILITY }}
                className="u-underline flex items-center whitespace-nowrap text-[12.5px] font-medium text-white/85 transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* The crest's column. */}
          <div aria-hidden />

          <div className="flex items-center justify-end">
            <SocialRow tone="light" />
          </div>
        </div>
      </div>

      {/* ---- white primary strip ---- */}
      {/* The 1px crimson rule is the same weight and colour as the plate's
          own stroke, and it is a box-shadow rather than a border so it costs
          the bar no height. The plate is a later sibling and paints over it,
          so the rule runs in from each side, disappears behind the plate's
          flanks, and comes back as the plate's own edge around the V — one
          line across the whole bar with a dip in the middle of it. */}
      <div className="bg-paper shadow-[0_1px_0_0_var(--color-crimson)]">
        {/* Mobile row: lockup left, menu right, no centre column. */}
        <div className={`${BAR_MOBILE} h-[62px] lg:hidden`}>
          <ScrollTopButton>
            <Image
              src={LOGO.lockup}
              alt="JECRC University — Build Your World"
              width={700}
              height={296}
              priority
              className="h-10 w-auto"
            />
          </ScrollTopButton>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-1.5"
          >
            <span
              className={cn(
                "block h-0.5 w-6 rounded-full bg-ink transition-transform duration-400 ease-out-expo",
                open && "translate-y-1 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 rounded-full bg-ink transition-transform duration-400 ease-out-expo",
                open && "-translate-y-1 -rotate-45"
              )}
            />
          </button>
        </div>

        {/* Desktop row. */}
        <div className={`hidden ${BAR} lg:grid`} style={{ height: STRIP_PRIMARY }}>
          <nav aria-label="On this page" className="flex items-center gap-7 2xl:gap-9">
            {PRIMARY.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="u-underline flex h-[44px] items-center whitespace-nowrap text-[14px] font-semibold text-ink transition-colors duration-300 hover:text-crimson 2xl:text-[15px]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div aria-hidden />

          <div className="flex items-center justify-end">
            <ApplyMenu tone="chrome" />
          </div>
        </div>
      </div>

      {/* ---- the crest plate, hanging through the seam ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-center lg:flex">
        <ScrollTopButton
          className="pointer-events-auto group relative block"
          style={{ width: PLATE.w, height: PLATE_H }}
        >
          <svg
            aria-hidden
            viewBox={`0 0 ${PLATE.w} ${PLATE_H}`}
            width={PLATE.w}
            height={PLATE_H}
            className="absolute inset-0"
            style={{ filter: "drop-shadow(0 9px 17px rgba(30,8,10,0.15))" }}
          >
            <path d={PLATE_PATH} fill="var(--color-paper)" />
            {/* Crimson on crimson above the seam, so it only draws below it. */}
            <path
              d={PLATE_PATH}
              fill="none"
              stroke="var(--color-crimson)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>

          <Image
            src={LOGO.lockup}
            alt="JECRC University, Build Your World"
            width={700}
            height={296}
            priority
            className="absolute left-1/2 w-auto -translate-x-1/2"
            style={{ height: PLATE.mark, top: PLATE.markTop }}
          />
        </ScrollTopButton>
      </div>

      {/* ---- mobile drawer ---- */}
      <div
        id="mobile-nav"
        inert={!open}
        className={cn(
          "overflow-hidden bg-paper transition-[max-height,opacity] duration-[700ms] ease-out-expo lg:hidden",
          open ? "max-h-[85svh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {/* The same 85svh the wrapper is capped at, repeated here on purpose.
            The wrapper animates its max-height and so has to clip, which means
            `overflow-y-auto` on this element did nothing without a height to
            scroll WITHIN: the nav simply grew to its content and the wrapper
            cut the end off. On a 320x480 screen the drawer is 408px and the
            links are 491px, so five of the thirteen were below the cut with no
            way to reach them. Capping this element too gives it a scrollport of
            its own, and `overscroll-contain` keeps that scroll from chaining
            out to the page behind it once it hits the end. */}
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-h-[85svh] w-full max-w-[1800px] flex-col gap-1 overflow-y-auto overscroll-contain border-t border-rule px-[max(1.25rem,env(safe-area-inset-left))] py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8"
        >
          {/* Apply leads the drawer: the one thing a visitor opened this menu
              to do should not need a scroll. */}
          <ApplyMenu tone="chrome" align="left" className="mb-5 self-start" />

          {MOBILE_NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...rel(item)}
              onClick={() => setOpen(false)}
              className="flex min-h-[52px] items-center border-b border-rule py-3.5 text-[16px] font-semibold text-ink transition-colors duration-300 hover:text-crimson"
            >
              {item.label}
            </a>
          ))}

          <div className="mt-7 pb-2">
            <SocialRow tone="dark" />
          </div>
        </nav>
      </div>
    </header>
  );
}
