import Image from "next/image";
import { FOOTER_NAV, type NavItem } from "@/lib/content/navigation";
import { BRAND, CONTACT, LOGO, SOCIAL } from "@/lib/content/site";
import { SOCIAL_ICONS } from "@/components/ui/Icons";

/**
 * The footer, rebuilt on the arts.vcu.edu anatomy.
 *
 * Five stacked bands inside one black block, each separated by a hairline:
 *
 *   1. wordmark left, social marks as outlined circles right
 *   2. three full-width outlined pills, equal columns
 *   3. four link columns, the first set noticeably heavier than the rest
 *   4. the statutory paragraph, small and quiet
 *   5. the ribbon: identity and copyright
 *
 * The weight jump between column one and columns two to four is the whole
 * hierarchy. Every column at the same size turns a footer into a wall.
 */

const PRIMARY: NavItem[] = FOOTER_NAV.study;
const COLUMNS: NavItem[][] = [FOOTER_NAV.campuses, FOOTER_NAV.institute];

const ACTIONS: NavItem[] = [
  { label: "Visit", href: "#admissions" },
  { label: "Apply", href: "#admissions" },
  { label: "Connect with us", href: "#admissions" },
];

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
    <footer className="bg-obsidian text-paper">
      <div className="u-shell py-14 md:py-16">
        {/* ---- 1. identity ---- */}
        <div className="flex flex-col gap-10 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" aria-label="JECRC, back to top">
            <Image
              src={LOGO.lockupMono}
              alt={`${BRAND.name} and JECRC Medical College Hospital and Research Centre`}
              width={557}
              height={258}
              className="h-auto w-52 md:w-60"
            />
          </a>

          <ul className="flex items-center gap-3">
            {SOCIAL.map((s) => {
              const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label}, opens in a new tab`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 transition-colors duration-300 hover:border-paper hover:bg-paper hover:text-obsidian"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <hr className="mt-12 border-0 border-t border-white/15" />

        {/* ---- 2. actions ---- */}
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {ACTIONS.map((a) => (
            <li key={a.label}>
              <a
                href={a.href}
                {...rel(a)}
                className="u-pill w-full py-4 text-paper hover:bg-paper hover:text-obsidian"
              >
                {a.label}
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
                    className="u-underline text-[20px] font-bold leading-tight tracking-[-0.02em] md:text-[22px]"
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
                      className="u-underline text-[16px] leading-snug text-white/80 transition-colors duration-300 hover:text-paper md:text-[17px]"
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
              <p className="u-eyebrow text-white/45">Admissions</p>
              <p className="mt-3 flex flex-col gap-1 text-[16px] text-white/80">
                <a href={CONTACT.admissionsPhoneHref} className="u-underline w-fit text-paper">
                  {CONTACT.admissionsPhone}
                </a>
                <a href={CONTACT.emailHref} className="u-underline w-fit">
                  {CONTACT.email}
                </a>
              </p>
            </div>
            <div>
              <p className="u-eyebrow text-white/45">Alwar NCR</p>
              <p className="mt-3 flex flex-col gap-1 text-[16px] text-white/80">
                <a href={CONTACT.ncrPhoneHref} className="u-underline w-fit text-paper">
                  {CONTACT.ncrPhone}
                </a>
                <a href={CONTACT.ncrEmailHref} className="u-underline w-fit break-all">
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
              <p className="u-eyebrow text-white/45">{a.label}</p>
              <address className="mt-3 max-w-[46ch] text-[13.5px] not-italic leading-[1.7] text-white/60">
                {a.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          ))}
        </div>

        <p className="mt-12 max-w-[92ch] text-[13px] leading-[1.7] text-white/55">
          JECRC University is a private university established under an Act of the Rajasthan State
          Legislature and recognised by the UGC under sections 2(f) and 12(B) of the UGC Act 1956.
          Technical programmes conform to AICTE directives. JECRC Foundation is approved by AICTE
          and affiliated to Rajasthan Technical University.
        </p>

        <hr className="mt-12 border-0 border-t border-white/15" />

        {/* ---- 5. ribbon ---- */}
        <div className="mt-8 flex flex-col gap-4 text-[13px] text-white/60 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-white/80">
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
