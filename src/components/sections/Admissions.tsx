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
    <Section id="admissions" tone="surface" className="u-grain overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 h-[36rem] w-[36rem] rounded-full opacity-20 blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--color-crimson) 0%, transparent 70%)" }}
      />

      <div className="relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-24">
        <div>
          <div data-reveal>
            <Eyebrow>Admissions 2026 to 2027</Eyebrow>
          </div>

          <h2
            data-reveal
            style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
            className="u-display mt-6 max-w-[14ch] pb-[0.1em] text-[2.5rem] leading-[1.02] text-paper sm:text-[3.25rem] lg:text-[4.25rem]"
          >
            Applications are{" "}
            <span className="u-display-italic text-crimson">open</span>
          </h2>

          <p
            data-reveal
            style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
            className="mt-7 max-w-[50ch] text-[15px] leading-[1.85] text-mist md:text-base"
          >
            Undergraduate, postgraduate, lateral entry and doctoral programmes across all three
            institutions. Scholarships are assessed on merit at the point of application, so there
            is no separate form to fill in.
          </p>

          <ol
            data-reveal
            style={{ "--reveal-delay": "210ms" } as React.CSSProperties}
            className="mt-12 grid gap-8 sm:grid-cols-3"
          >
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="u-figure text-[1.25rem] text-crimson">{s.n}</span>
                <h3 className="mt-3 text-[15px] font-semibold text-paper">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.75] text-mist">{s.body}</p>
              </li>
            ))}
          </ol>

          <div
            data-reveal
            style={{ "--reveal-delay": "270ms" } as React.CSSProperties}
            className="mt-12 flex flex-col gap-2 border-t border-line pt-8 text-[14px] text-mist sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8"
          >
            <a href={CONTACT.admissionsPhoneHref} className="u-underline text-paper">
              {CONTACT.admissionsPhone}
            </a>
            <a href={CONTACT.altPhoneHref} className="u-underline text-paper">
              {CONTACT.altPhone}
            </a>
            <a href={CONTACT.emailHref} className="u-underline text-paper">
              {CONTACT.email}
            </a>
            <span className="text-dim">{CONTACT.note}</span>
          </div>
        </div>

        {/* ---- the three portals ---- */}
        <ul className="flex flex-col gap-4 self-center">
          {APPLY_LINKS.map((link, i) => (
            <li
              key={link.id}
              data-reveal
              style={{ "--reveal-delay": `${120 + i * 100}ms` } as React.CSSProperties}
            >
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 rounded-2xl border border-line bg-void p-7 transition-colors duration-500 hover:border-crimson hover:bg-crimson md:p-8"
              >
                <span>
                  <span className="u-label text-crimson transition-colors duration-500 group-hover:text-white/80">
                    Apply · {link.label}
                  </span>
                  <span className="u-display mt-3 block text-[1.4rem] leading-tight text-paper md:text-[1.7rem]">
                    {link.name}
                  </span>
                </span>
                <ArrowUpRight className="h-6 w-6 shrink-0 text-dim transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
