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
 * the crest in a white shield hanging through a notch between them. The shield
 * is a clip-path rather than an image so it stays crisp at any density.
 *
 * The contents are not theirs. Their bar carries a full site's menu; this
 * fronts one page, so it carries the social marks, three in-page jumps and the
 * apply button, and nothing else. A directory belongs in the footer.
 *
 * It does not exist while the scroll tour is playing: the film gets a clean
 * frame, and the bar drops in on the beat the tour ends.
 */

/** Where the shield's flat edge stops and the point begins. */
const SHIELD_CLIP = "polygon(0 0, 100% 0, 100% 76%, 50% 100%, 0 76%)";

/**
 * The chrome runs wider and with tighter gutters than the editorial shell, the
 * way the live navbar does. Three grid columns rather than flex with a spacer:
 * two `minmax(0, 1fr)` tracks are always equal, so the fixed centre column sits
 * exactly on the viewport centre and the crest can never drift onto a link.
 */
const BAR =
  "mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_280px_minmax(0,1fr)] items-center px-[max(1.25rem,env(safe-area-inset-left))] md:px-8 lg:px-6 2xl:px-10";

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
        <div className={`${BAR} h-[42px]`}>
          <nav aria-label="The group" className="flex items-center gap-6">
            {UTILITY.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...rel(item)}
                className="u-underline flex h-[42px] items-center whitespace-nowrap text-[12.5px] font-medium text-white/85 transition-colors duration-300 hover:text-white"
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
      <div className="bg-paper shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        {/* Mobile row: lockup left, menu right, no centre column. */}
        <div className={`${BAR_MOBILE} h-[62px] lg:hidden`}>
          <ScrollTopButton>
            <Image
              src={LOGO.lockup}
              alt="JECRC University and JECRC Medical College Hospital and Research Centre"
              width={557}
              height={258}
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
        <div className={`hidden ${BAR} h-[56px] lg:grid`}>
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

      {/* ---- crest shield, hanging through the notch ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden justify-center lg:flex">
        <ScrollTopButton
          className="pointer-events-auto flex h-[122px] w-[268px] items-start justify-center bg-paper px-4 pt-2.5 drop-shadow-[0_12px_20px_rgba(0,0,0,0.14)]"
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
