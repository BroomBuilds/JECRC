import { OPPORTUNITIES } from "@/lib/content/programmes";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * The things students do here that are not a degree.
 *
 * Deliberately plain: a numbered list on a flat ground, sitting right after the
 * heavier Programmes section. Two elaborate sections back to back cancel each
 * other out.
 */
export default function Opportunities() {
  return (
    <Section id="life" tone="void">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
        <SectionHeading
          eyebrow="Beyond the timetable"
          title={
            <>
              The part that is{" "}
              <span className="u-display-italic text-crimson">not on the transcript</span>
            </>
          }
          lead="A prototyping floor, an incubation centre, a national space-science exhibition and a three-day festival that students book, budget, light and run end to end."
        />

        <ul className="border-t border-line">
          {OPPORTUNITIES.map((o, i) => (
            <li
              key={o.name}
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              className="group grid gap-2 border-b border-line py-7 transition-colors duration-500 hover:border-crimson/40 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-6"
            >
              <span className="u-figure pt-1 text-[1.1rem] text-crimson/70 transition-colors duration-500 group-hover:text-crimson">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold leading-snug text-paper md:text-[19px]">
                  {o.name}
                </h3>
                <p className="mt-2 max-w-[52ch] text-[14.5px] leading-[1.8] text-mist">{o.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
