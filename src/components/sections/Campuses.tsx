import { INSTITUTIONS } from "@/lib/content/universities";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ArrowUpRight } from "@/components/ui/Icons";

/**
 * The three institutions.
 *
 * A landing page fronting three destinations has one job before anything else:
 * make it obvious which one the visitor wants. So this sits directly under the
 * film, before any story-telling, and every card carries its own apply link.
 */
export default function Campuses() {
  return (
    <Section id="campuses" tone="paper">
      <SectionHeading
        eyebrow="Three institutions, one group"
        title={
          <>
            Pick the campus,{" "}
            <span className="u-serif-italic text-crimson">then pick the course</span>
          </>
        }
        lead="Two universities and the engineering college the group grew out of. They share a faculty network, an incubation centre and a placement cell, and each takes its own application."
      />

      <ul className="mt-16 grid gap-px overflow-hidden rounded-lg bg-rule md:mt-20 lg:grid-cols-3">
        {INSTITUTIONS.map((inst, i) => (
          <li
            key={inst.id}
            data-reveal
            style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}
            className="group flex flex-col bg-paper transition-colors duration-500 hover:bg-bone"
          >
            <div className="flex flex-1 flex-col p-8 md:p-10">
              <span className="u-eyebrow text-crimson">{inst.positioning}</span>

              <h3 className="u-grotesk mt-6 text-[1.75rem] text-ink md:text-[2rem]">{inst.name}</h3>
              <p className="mt-2 text-[14px] text-quiet">{inst.place}</p>

              <p className="mt-7 flex-1 text-[15.5px] leading-[1.7] text-graphite">{inst.body}</p>

              <dl className="mt-9 grid grid-cols-3 gap-4 border-t border-rule pt-7">
                {inst.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="sr-only">{f.label}</dt>
                    <dd className="u-figure text-[1.75rem] text-ink">{f.value}</dd>
                    <p className="mt-2 text-[12px] leading-tight text-quiet">{f.label}</p>
                  </div>
                ))}
              </dl>

              <p className="mt-7 text-[12.5px] leading-relaxed text-quiet">{inst.established}</p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={inst.apply}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-pill border-crimson bg-crimson text-paper hover:bg-crimson-deep"
                >
                  Apply
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href={inst.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-pill border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Visit site
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
