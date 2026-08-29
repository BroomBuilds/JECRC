import { OPPORTUNITIES } from "@/lib/content/schools";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * The things students do here that are not a degree.
 *
 * Deliberately plain: a numbered list on a flat ground, sitting right after the
 * majors band. Two elaborate sections back to back cancel each other out.
 */
export default function Opportunities() {
  return (
    <Section id="life" tone="paper">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        <SectionHeading
          eyebrow="Beyond the timetable"
          title={
            <>
              The part that is{" "}
              <span className="u-serif-italic text-crimson">not on the transcript</span>
            </>
          }
          lead="A prototyping floor, an incubation centre, a national space-science exhibition and a three-day festival that students book, budget, light and run end to end."
        />

        <ul className="border-t border-rule">
          {OPPORTUNITIES.map((o, i) => (
            <li
              key={o.name}
              data-reveal
              style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
              className="group grid gap-2 border-b border-rule py-7 transition-colors duration-500 hover:border-crimson/50 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6"
            >
              <span className="u-figure pt-1 text-[1.1rem] text-crimson/60 transition-colors duration-500 group-hover:text-crimson">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="u-grotesk text-[1.15rem] text-ink md:text-[1.35rem]">{o.name}</h3>
                <p className="mt-2.5 max-w-[52ch] text-[15.5px] leading-[1.7] text-graphite">
                  {o.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
