import Image from "next/image";
import { FOOTER_NAV, type NavItem } from "@/lib/content/navigation";
import { BRAND, CONTACT, LOGO, SOCIAL } from "@/lib/content/site";
import { APPLY_LINKS } from "@/lib/content/universities";
import { SOCIAL_ICONS } from "@/components/ui/Icons";
import ScrollTopButton from "@/components/ui/ScrollTopButton";

/**
 * The footer, on the arts.vcu.edu anatomy.
 *
 * Five bands separated by hairlines: identity and social marks, three
 * full-width pills, four link columns with the first set noticeably heavier,
 * the statutory paragraph, then the ribbon. The weight jump between column one
 * and the rest is the whole hierarchy; every column at one size turns a footer
 * into a wall.
 *
 * Black ground, white lockup, white rules. This is the one place on the page
 * that inverts to a flat black, and it stays that way: an earlier pass tinted
 * it oxblood and ran red through every rule, which turned the quietest part of
 * the page into the loudest.
 */

const PRIMARY: NavItem[] = FOOTER_NAV.study;
const COLUMNS: NavItem[][] = [FOOTER_NAV.campuses, FOOTER_NAV.institute];

const ADDRESSES = [
  {
    label: "Jaipur campus",
    lines: [
      "Plot No. IS-2036 to IS-2039, Ramchandrapura,",
      "Vidhani, Sitapura Extension, Jaipur, Rajasthan 303905",
    ],
  },
  {
    label: "Alwar NCR campus",
    lines: ["NCR Campus II, North Extension, Matsya Industrial Area,", "Alwar, Rajasthan 301001"],
  },
];

const rel = (item: NavItem) =>
  item.external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {};

export default function Footer() {
  return (
    <footer data-cursor-invert className="bg-obsidian text-paper">
      <div className="u-shell py-14 pb-[max(3.5rem,env(safe-area-inset-bottom))] md:py-16">
        {/* ---- 1. identity ---- */}
        <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          {/* Brand red on transparent, never the plated version. On a black
              ground the plate reads as a white card sitting on the footer
              rather than as the mark printed on it. */}
          <ScrollTopButton className="w-fit">
            <Image
              src={LOGO.lockupRed}
              alt={`${BRAND.name} and JECRC Medical College Hospital and Research Centre`}
              width={557}
              height={258}
              className="h-auto w-48 md:w-60"
            />
          </ScrollTopButton>

          {/* Wraps rather than pushing the page wide: five 44px targets plus
              gaps need 268px, and a foldable cover screen has 244px of
              content. */}
          <ul className="-mx-1 flex flex-wrap items-center">
            {SOCIAL.map((s) => {
              const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label}, opens in a new tab`}
                    className="m-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-obsidian"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <hr className="mt-12 border-0 border-t border-white/15" />

        {/* ---- 2. the three portals ---- */}
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {APPLY_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="u-pill w-full py-4 text-paper hover:bg-paper hover:text-obsidian"
              >
                Apply · {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* ---- 3. links ---- */}
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <nav aria-label="Study">
            <ul className="flex flex-col gap-2.5">
              {PRIMARY.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    {...rel(item)}
                    className="u-underline inline-flex min-h-[44px] items-center text-[20px] font-bold leading-tight tracking-[-0.025em] md:text-[22px]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {COLUMNS.map((col, i) => (
            <nav key={i} aria-label={i === 0 ? "Campuses" : "The institution"}>
              <ul className="flex flex-col gap-2.5">
                {col.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...rel(item)}
                      className="u-underline inline-flex min-h-[44px] items-center text-[16px] leading-snug text-paper/70 transition-colors duration-300 hover:text-paper md:text-[17px]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-6">
            <div>
              <p className="u-eyebrow text-paper/45">Admissions</p>
              <p className="mt-1 flex flex-col text-[16px] text-paper/70">
                <a href={CONTACT.admissionsPhoneHref} className="u-underline inline-flex min-h-[44px] w-fit items-center text-paper">
                  {CONTACT.admissionsPhone}
                </a>
                <a href={CONTACT.emailHref} className="u-underline inline-flex min-h-[44px] w-fit items-center">
                  {CONTACT.email}
                </a>
              </p>
            </div>
            <div>
              <p className="u-eyebrow text-paper/45">Alwar NCR</p>
              <p className="mt-1 flex flex-col text-[16px] text-paper/70">
                <a href={CONTACT.ncrPhoneHref} className="u-underline inline-flex min-h-[44px] w-fit items-center text-paper">
                  {CONTACT.ncrPhone}
                </a>
                <a href={CONTACT.ncrEmailHref} className="u-underline inline-flex min-h-[44px] w-fit items-center break-all">
                  {CONTACT.ncrEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ---- 4. statutory ---- */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {ADDRESSES.map((a) => (
            <div key={a.label}>
              <p className="u-eyebrow text-paper/45">{a.label}</p>
              <address className="mt-3 max-w-[46ch] text-[13.5px] not-italic leading-[1.7] text-paper/55">
                {a.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-[92ch] border-t border-white/15 pt-10 text-[13px] leading-[1.7] text-paper/50">
          JECRC University is a private university established under an Act of the Rajasthan State
          Legislature and recognised by the UGC under sections 2(f) and 12(B) of the UGC Act 1956.
          Technical programmes conform to AICTE directives. JECRC Foundation is approved by AICTE
          and affiliated to Rajasthan Technical University.
        </p>

        <hr className="mt-12 border-0 border-t border-white/15" />

        {/* ---- 5. ribbon ---- */}
        <div className="mt-8 flex flex-col gap-4 text-[13px] text-paper/55 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-paper/80">
            {BRAND.group} · Jaipur and Alwar NCR, Rajasthan, India
          </p>
          <p>
            Copyright {BRAND.copyrightYear} {BRAND.group}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
