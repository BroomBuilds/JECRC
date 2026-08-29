"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MOBILE_NAV,
  PRIMARY_LEFT,
  PRIMARY_RIGHT,
  UTILITY_LEFT,
  UTILITY_RIGHT,
  type NavItem,
} from "@/lib/content/navigation";
import { LOGO, SOCIAL } from "@/lib/content/site";
import { useTourComplete } from "@/lib/hooks/useTourComplete";
import { cn } from "@/lib/utils/cn";
import ApplyMenu from "@/components/ui/ApplyMenu";
import { SOCIAL_ICONS } from "@/components/ui/Icons";

/**
 * The navigation, rebuilt from jecrcuniversity.edu.in.
 *
 * Same two-strip anatomy as the live site: a red utility bar over a white
 * primary bar, with the crest in a white shield that hangs into the page
 * through a notch. The shield is a clip-path rather than an image so it stays
 * crisp at any density and takes the same shadow as the bars.
 *
 * The one behavioural difference: it does not exist while the scroll tour is
 * playing. The film gets a clean frame, and the bar drops in on the beat the
 * tour ends (see useTourComplete).
 */

/** Where the shield's flat edge stops and the point begins. */
const SHIELD_CLIP = "polygon(0 0, 100% 0, 100% 76%, 50% 100%, 0 76%)";

/**
 * The chrome runs wider and with tighter gutters than the editorial shell
 * below it, the way the live navbar does.
 *
 * Three grid columns rather than flex with a spacer. Two `minmax(0, 1fr)`
 * tracks are always equal, so the fixed centre column is exactly on the
 * viewport centre and the crest can never drift onto a link. Flexbox does not
 * give that: `flex-1` sides refuse to shrink below their nowrap content, so
 * the wider group pushes the centre off-axis, which is precisely how the first
 * pass ended up with the crest sitting on top of "Campus Life".
 */
const BAR =
  "mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)] items-center px-5 md:px-8 lg:px-6 2xl:px-10";

/** Mobile has no centre column: the lockup lives in the bar itself. */
const BAR_MOBILE = "mx-auto flex w-full max-w-[1800px] items-center justify-between px-5 md:px-8";

function UtilityLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="u-underline whitespace-nowrap text-[13px] font-medium text-white/90 transition-colors duration-300 hover:text-white 2xl:text-[15px]"
    >
      {item.label}
    </a>
  );
}

function PrimaryLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="u-underline whitespace-nowrap text-[13px] font-semibold text-chrome-ink transition-colors duration-300 hover:text-crimson 2xl:text-[15px]"
    >
      {item.label}
    </a>
  );
}

export default function Navbar() {
  const revealed = useTourComplete("tour");
  const [open, setOpen] = useState(false);

  // A drawer that stays open behind a resize into the desktop layout leaves the
  // page scroll-locked with nothing on screen to close.
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
        <div className={`${BAR} h-[46px]`}>
          <nav aria-label="Secondary" className="flex items-center gap-5 2xl:gap-8">
            {UTILITY_LEFT.map((item) => (
              <UtilityLink key={item.label} item={item} />
            ))}
          </nav>

          {/* The crest's column. Wider than the 268px shield so the nearest
              link on each side never sits flush against its edge. */}
          <div aria-hidden />

          <div className="flex items-center justify-end gap-5 2xl:gap-7">
            <nav aria-label="Utility" className="flex items-center gap-5 2xl:gap-8">
              {UTILITY_RIGHT.map((item) => (
                <UtilityLink key={item.label} item={item} />
              ))}
            </nav>
            <ul className="flex items-center gap-3.5 2xl:gap-4">
              {SOCIAL.map((s) => {
                const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label}, opens in a new tab`}
                      className="block text-white/85 transition-colors duration-300 hover:text-white"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ---- white primary strip ---- */}
      <div className="bg-chrome shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        {/* Mobile row: lockup left, menu right, no centre column. */}
        <div className={`${BAR_MOBILE} h-[62px] lg:hidden`}>
          <a href="#top" aria-label="JECRC, back to top">
            <Image
              src={LOGO.lockup}
              alt="JECRC University and JECRC Medical College Hospital and Research Centre"
              width={557}
              height={258}
              priority
              className="h-10 w-auto"
            />
          </a>

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
                "block h-0.5 w-6 rounded-full bg-chrome-ink-strong transition-transform duration-400 ease-out-expo",
                open && "translate-y-1 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-6 rounded-full bg-chrome-ink-strong transition-transform duration-400 ease-out-expo",
                open && "-translate-y-1 -rotate-45"
              )}
            />
          </button>
        </div>

        {/* Desktop row. */}
        <div className={`hidden ${BAR} h-[54px] lg:grid`}>
          <nav aria-label="Primary" className="flex items-center gap-5 2xl:gap-8">
            {PRIMARY_LEFT.map((item) => (
              <PrimaryLink key={item.label} item={item} />
            ))}
          </nav>

          <div aria-hidden />

          <div className="flex items-center justify-end gap-5 2xl:gap-7">
            <nav aria-label="Primary, continued" className="flex items-center gap-5 2xl:gap-8">
              {PRIMARY_RIGHT.map((item) => (
                <PrimaryLink key={item.label} item={item} />
              ))}
            </nav>
            <ApplyMenu tone="chrome" />
          </div>
        </div>
      </div>

      {/* ---- crest shield, hanging through the notch ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-center lg:flex">
        <a
          href="#top"
          aria-label="JECRC, back to top"
          className="pointer-events-auto flex h-[122px] w-[268px] items-start justify-center bg-chrome px-4 pt-2.5 drop-shadow-[0_12px_20px_rgba(0,0,0,0.14)]"
          style={{ clipPath: SHIELD_CLIP }}
        >
          <Image
            src={LOGO.lockup}
            alt="JECRC University and JECRC Medical College Hospital and Research Centre"
            width={557}
            height={258}
            priority
            className="h-auto w-full"
          />
        </a>
      </div>

      {/* ---- mobile drawer ---- */}
      <div
        id="mobile-nav"
        inert={!open}
        className={cn(
          "overflow-hidden bg-chrome transition-[max-height,opacity] duration-[700ms] ease-out-expo lg:hidden",
          open ? "max-h-[85svh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 overflow-y-auto border-t border-black/5 px-5 py-5 md:px-8">
          {/* Apply leads the drawer. The full link list is taller than the
              panel, so anything below it needs a scroll to reach, and the one
              thing a visitor opened this menu to do should not. */}
          <ApplyMenu tone="chrome" align="left" className="mb-5 self-start" />

          {MOBILE_NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => setOpen(false)}
              className="border-b border-black/5 py-3.5 text-[15px] font-semibold text-chrome-ink transition-colors duration-300 hover:text-crimson"
            >
              {item.label}
            </a>
          ))}
          <ul className="mt-7 flex items-center gap-5 pb-2">
            {SOCIAL.map((s) => {
              const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label}, opens in a new tab`}
                    className="block text-chrome-ink transition-colors duration-300 hover:text-crimson"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
