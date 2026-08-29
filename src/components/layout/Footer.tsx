import Image from "next/image";
import { FOOTER_NAV, type NavItem } from "@/lib/content/navigation";
import { BRAND, CONTACT, LOGO, SOCIAL } from "@/lib/content/site";
import { SOCIAL_ICONS } from "@/components/ui/Icons";

const GROUPS: { heading: string; items: NavItem[] }[] = [
  { heading: "Study", items: FOOTER_NAV.study },
  { heading: "Campuses", items: FOOTER_NAV.campuses },
  { heading: "The institution", items: FOOTER_NAV.institute },
];

const ADDRESSES = [
  {
    label: "Jaipur campus",
    lines: [
      "Plot No. IS-2036 to IS-2039, Ramchandrapura,",
      "Vidhani, Sitapura Extension,",
      "Jaipur, Rajasthan 303905",
    ],
  },
  {
    label: "Alwar NCR campus",
    lines: ["NCR Campus II, North Extension,", "Matsya Industrial Area,", "Alwar, Rajasthan 301001"],
  },
];

function FooterLink({ item }: { item: NavItem }) {
  return (
    <a
      href={item.href}
      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="u-underline text-[13.5px] text-mist transition-colors duration-300 hover:text-paper"
    >
      {item.label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="u-shell py-20 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] lg:gap-20">
          {/* ---- identity ---- */}
          <div>
            <Image
              src={LOGO.lockupMono}
              alt={`${BRAND.name} and JECRC Medical College Hospital and Research Centre`}
              width={557}
              height={258}
              // The keyed white version, since this sits on the dark ground.
              className="h-auto w-44"
            />

            <p className="u-display-italic mt-8 text-[1.6rem] leading-tight text-paper">
              {BRAND.tagline}
            </p>
            <p className="mt-4 max-w-[38ch] text-[13.5px] leading-[1.8] text-mist">
              {BRAND.promise}. Two universities and the engineering college the group grew out of,
              in Jaipur and Alwar, Rajasthan.
            </p>

            <ul className="mt-8 flex items-center gap-5">
              {SOCIAL.map((s) => {
                const Icon = SOCIAL_ICONS[s.label as keyof typeof SOCIAL_ICONS];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label}, opens in a new tab`}
                      className="block text-dim transition-colors duration-300 hover:text-crimson"
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ---- link columns ---- */}
          <div className="grid gap-10 sm:grid-cols-3">
            {GROUPS.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="u-label text-dim">{group.heading}</h2>
                <ul className="mt-6 flex flex-col gap-3.5">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ---- addresses and contact ---- */}
        <div className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {ADDRESSES.map((a) => (
            <div key={a.label}>
              <h2 className="u-label text-dim">{a.label}</h2>
              <address className="mt-5 text-[13.5px] not-italic leading-[1.8] text-mist">
                {a.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          ))}

          <div>
            <h2 className="u-label text-dim">Admissions</h2>
            <p className="mt-5 flex flex-col gap-1.5 text-[13.5px] text-mist">
              <a href={CONTACT.admissionsPhoneHref} className="u-underline w-fit text-paper">
                {CONTACT.admissionsPhone}
              </a>
              <a href={CONTACT.emailHref} className="u-underline w-fit">
                {CONTACT.email}
              </a>
              <span className="text-dim">{CONTACT.note}</span>
            </p>
          </div>

          <div>
            <h2 className="u-label text-dim">Alwar NCR</h2>
            <p className="mt-5 flex flex-col gap-1.5 text-[13.5px] text-mist">
              <a href={CONTACT.ncrPhoneHref} className="u-underline w-fit text-paper">
                {CONTACT.ncrPhone}
              </a>
              <a href={CONTACT.ncrEmailHref} className="u-underline w-fit break-all">
                {CONTACT.ncrEmail}
              </a>
            </p>
          </div>
        </div>

        {/* ---- legal ---- */}
        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-[12px] text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright {BRAND.copyrightYear} {BRAND.group}. All rights reserved.
          </p>
          <p className="max-w-[62ch] sm:text-right">
            Private university established under an Act of the Rajasthan State Legislature.
            Recognised by the UGC under sections 2(f) and 12(B) of the UGC Act 1956.
          </p>
        </div>
      </div>
    </footer>
  );
}
