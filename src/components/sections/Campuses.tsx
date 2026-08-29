import { INSTITUTIONS } from "@/lib/content/universities";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * The three institutions.
 *
 * A landing page fronting three destinations has one job before anything else:
 * make it obvious which one the visitor wants. So this sits directly under the
 * film, before the story-telling, and every card carries its own apply link.
 */

const ACCENT = {
  crimson: "from-crimson/25",
  ember: "from-ember/20",
  slate: "from-white/10",
} as const;

export default function Campuses() {
  return (
    <Section id="campuses" tone="void">
      <SectionHeading
        eyebrow="Three institutions, one group"
        title={
          <>
            Pick the campus,{" "}
            <span className="u-display-italic text-crimson">then pick the course</span>
          </>
        }
        lead="Two universities and the engineering college the group grew out of. They share a faculty network, an incubation centre and a placement cell, and each takes its own application."
      />

      <ul className="mt-16 grid gap-6 md:mt-20 lg:grid-cols-3">
        {INSTITUTIONS.map((inst, i) => (
          <li
            key={inst.id}
            data-reveal
            style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors duration-500 hover:border-crimson/45"
          >
            {/* Accent wash, only on hover, so the three cards read as equals
                until the visitor commits to one. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b ${ACCENT[inst.accent]} to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100`}
            />

            <div className="relative flex flex-1 flex-col p-7 md:p-9">
              <span className="u-label text-crimson">{inst.positioning}</span>

              <h3 className="u-display mt-5 text-[1.75rem] leading-tight text-paper md:text-[2rem]">
                {inst.name}
              </h3>
              <p className="mt-2 text-[13px] tracking-wide text-dim">{inst.place}</p>

              <p className="mt-6 flex-1 text-[14.5px] leading-[1.8] text-mist">{inst.body}</p>

              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-7">
                {inst.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="sr-only">{f.label}</dt>
                    <dd className="u-figure text-[1.6rem] text-paper">{f.value}</dd>
                    <p className="mt-1.5 text-[11px] leading-tight text-dim">{f.label}</p>
                  </div>
                ))}
              </dl>

              <p className="mt-7 text-[12px] leading-relaxed text-dim">{inst.established}</p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={inst.apply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-label inline-flex items-center gap-2 rounded-full bg-crimson px-6 py-3 text-white transition-colors duration-300 hover:bg-crimson-lit"
                >
                  Apply
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={inst.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-label inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-mist transition-colors duration-300 hover:border-white/35 hover:text-paper"
                >
                  Visit site
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
