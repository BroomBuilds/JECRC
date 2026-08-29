import { CONTACT } from "@/lib/content/site";
import { APPLY_LINKS } from "@/lib/content/universities";
import { Section, Eyebrow } from "@/components/ui/Section";
import { ArrowUpRight } from "@/components/ui/Icons";

/** The three steps as the university describes them on its own admissions page. */
const STEPS = [
  {
    n: "01",
    title: "You apply",
    body: "Tell us a little about yourself and we handle the rest. The online form takes about ten minutes.",
  },
  {
    n: "02",
    title: "We connect",
    body: "An admissions representative gets in touch and walks you through the remaining steps.",
  },
  {
    n: "03",
    title: "You get ready",
    body: "Once the application is complete and your representative has confirmed it, you build your schedule.",
  },
];

/**
 * The closing call to action.
 *
 * Last section before the footer, and the only place on the page where all
 * three application portals sit side by side as equals rather than inside a
 * dropdown. Someone who has read this far knows which one they want.
 */
export default function Admissions() {
  return (
    <Section id="admissions" tone="paper">
      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-24">
        <div>
          <div data-reveal>
            <Eyebrow>Admissions 2026 to 2027</Eyebrow>
          </div>

          <h2
            data-reveal
            style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
            className="u-serif mt-6 max-w-[13ch] text-[2.75rem] text-ink sm:text-[3.5rem] lg:text-[clamp(3.25rem,4.4vw,4.75rem)]"
          >
            Applications are <span className="u-serif-italic text-crimson">open</span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
            className="mt-8 max-w-[50ch] text-[16px] leading-[1.7] text-graphite md:text-[17px]"
          >
            Undergraduate, postgraduate, lateral entry and doctoral programmes across all three
            institutions. Scholarships are assessed on merit at the point of application, so there
            is no separate form to fill in.
          </p>

          <ol
            data-reveal
            style={{ "--reveal-delay": "200ms" } as React.CSSProperties}
            className="mt-12 grid gap-8 sm:grid-cols-3"
          >
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="u-figure text-[1.25rem] text-crimson">{s.n}</span>
                <h3 className="mt-3 text-[16px] font-bold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-graphite">{s.body}</p>
              </li>
            ))}
          </ol>

          <div
            data-reveal
            style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
            className="mt-12 flex flex-col gap-2 border-t border-rule pt-8 text-[15px] text-graphite sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8"
          >
            <a href={CONTACT.admissionsPhoneHref} className="u-underline font-semibold text-ink">
              {CONTACT.admissionsPhone}
            </a>
            <a href={CONTACT.altPhoneHref} className="u-underline font-semibold text-ink">
              {CONTACT.altPhone}
            </a>
            <a href={CONTACT.emailHref} className="u-underline font-semibold text-ink">
              {CONTACT.email}
            </a>
            <span className="text-quiet">{CONTACT.note}</span>
          </div>
        </div>

        {/* ---- the three portals ---- */}
        <ul className="flex flex-col gap-4 self-center">
          {APPLY_LINKS.map((link, i) => (
            <li
              key={link.id}
              data-reveal
              style={{ "--reveal-delay": `${110 + i * 90}ms` } as React.CSSProperties}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 rounded-lg border border-rule bg-paper p-7 transition-colors duration-500 hover:border-ink hover:bg-ink md:p-8"
              >
                <span>
                  <span className="u-eyebrow block text-crimson transition-colors duration-500 group-hover:text-white/70">
                    Apply · {link.label}
                  </span>
                  <span className="u-grotesk mt-3 block text-[1.4rem] text-ink transition-colors duration-500 group-hover:text-paper md:text-[1.65rem]">
                    {link.name}
                  </span>
                </span>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-quiet transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-paper" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
