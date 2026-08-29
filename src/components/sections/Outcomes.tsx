import { PLACEMENT_DETAIL, PLACEMENT_STATS, RECRUITERS } from "@/lib/content/outcomes";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * Placements.
 *
 * Numbers first, because this is the section prospective students and their
 * parents scroll to find. The recruiter wall is a CSS marquee: two copies of
 * one track translated by exactly half its width, which loops seamlessly with
 * no JavaScript and no layout thrash.
 */
export default function Outcomes() {
  return (
    <Section id="outcomes" tone="bone">
      <SectionHeading
        eyebrow="Placements, 2025 to 2026"
        title={
          <>
            Two thousand offers{" "}
            <span className="u-serif-italic text-crimson">in one season</span>
          </>
        }
        lead="Two hundred recruiters on campus over a season that ran two hundred and thirty days, with eight hundred and fifty-six of those offers coming from Fortune 500 companies."
      />

      {/* ---- headline figures ---- */}
      <dl className="mt-16 grid gap-px overflow-hidden rounded-lg bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {PLACEMENT_STATS.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
            className="bg-paper p-8 md:p-10"
          >
            <dd className="u-figure text-[3rem] text-ink md:text-[3.75rem]">
              {s.value}
              {s.unit && (
                <span className="ml-1 text-[1.5rem] text-crimson md:text-[1.75rem]">{s.unit}</span>
              )}
            </dd>
            <dt className="mt-5 text-[14px] leading-snug text-graphite">{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* ---- supporting detail ---- */}
      <dl className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEMENT_DETAIL.map((d, i) => (
          <div
            key={d.label}
            data-reveal
            style={{ "--reveal-delay": `${i * 60}ms` } as React.CSSProperties}
            className="flex items-baseline justify-between gap-4 border-b border-rule pb-4"
          >
            <dt className="text-[14px] text-quiet">{d.label}</dt>
            <dd className="text-[15px] font-bold tracking-tight text-ink">{d.value}</dd>
          </div>
        ))}
      </dl>

      {/* ---- recruiter wall ---- */}
      <div className="mt-20 md:mt-24">
        <p data-reveal className="u-eyebrow text-quiet">
          Where they went
        </p>

        <div
          className="u-marquee relative mt-8 overflow-hidden"
          // Edges fade rather than cut, so the loop has no visible seam.
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
          }}
        >
          <ul className="u-marquee-track" style={{ "--marquee-duration": "60s" } as React.CSSProperties}>
            {/* Two copies: the animation translates by -50%, so the second copy
                lands exactly where the first began. The gap lives inside each
                copy as trailing padding rather than on the track, otherwise
                half a gap of drift shows up at the loop point. The duplicate is
                decorative, so it is hidden from assistive tech. */}
            {[0, 1].map((copy) => (
              <li key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3">
                {RECRUITERS.map((name) => (
                  <span
                    key={`${copy}-${name}`}
                    className="whitespace-nowrap rounded-full border border-rule bg-paper px-6 py-3.5 text-[14px] font-semibold tracking-tight text-graphite"
                  >
                    {name}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-[13px] text-quiet">
          Recruiters as named on the university placements page. Figures are for the 2025 to 2026
          season.
        </p>
      </div>
    </Section>
  );
}
