import { PLACEMENT_DETAIL, PLACEMENT_STATS, RECRUITERS } from "@/lib/content/outcomes";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * Placements.
 *
 * Numbers first, because this is the section prospective students and their
 * parents scroll to find. The recruiter wall is a CSS marquee: two copies of
 * the same track translated by exactly half its width, which loops seamlessly
 * with no JavaScript and no layout thrash.
 */
export default function Outcomes() {
  return (
    <Section id="outcomes" tone="ink">
      <SectionHeading
        eyebrow="Placements, 2025 to 2026"
        title={
          <>
            Two thousand offers{" "}
            <span className="u-display-italic text-crimson">in one season</span>
          </>
        }
        lead="Two hundred recruiters on campus over a season that ran two hundred and thirty days, with eight hundred and fifty-six of those offers coming from Fortune 500 companies."
      />

      {/* ---- headline figures ---- */}
      <dl className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {PLACEMENT_STATS.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            className="bg-surface p-8 md:p-10"
          >
            <dd className="u-figure text-[3rem] text-paper md:text-[3.75rem]">
              {s.value}
              {s.unit && <span className="ml-1 text-[1.5rem] text-crimson md:text-[1.75rem]">{s.unit}</span>}
            </dd>
            <dt className="mt-4 text-[13px] leading-snug text-mist">{s.label}</dt>
          </div>
        ))}
      </dl>

      {/* ---- supporting detail ---- */}
      <dl className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {PLACEMENT_DETAIL.map((d, i) => (
          <div
            key={d.label}
            data-reveal
            style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
            className="flex items-baseline justify-between gap-4 border-b border-line pb-4"
          >
            <dt className="text-[13.5px] text-dim">{d.label}</dt>
            <dd className="text-[14.5px] font-semibold text-paper">{d.value}</dd>
          </div>
        ))}
      </dl>

      {/* ---- recruiter wall ---- */}
      <div className="mt-20 md:mt-24">
        <p data-reveal className="u-label text-dim">
          Where they went
        </p>

        <div
          className="u-marquee relative mt-8 overflow-hidden"
          // Edges fade rather than cut, so the loop has no visible seam.
          style={{
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <ul className="u-marquee-track" style={{ "--marquee-duration": "60s" } as React.CSSProperties}>
            {/* Two copies: the animation translates by -50%, so the second copy
                lands exactly where the first began. The gap lives inside each
                copy as trailing padding rather than on the track, otherwise
                half a gap of drift shows up at the loop point. The duplicate
                is decorative, so it is hidden from assistive tech. */}
            {[0, 1].map((copy) => (
              <li key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3 pr-3">
                {RECRUITERS.map((name) => (
                  <span
                    key={`${copy}-${name}`}
                    className="whitespace-nowrap rounded-full border border-line bg-surface px-6 py-3.5 text-[13.5px] font-medium text-mist"
                  >
                    {name}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-[12.5px] text-dim">
          Recruiters as named on the university placements page. Figures are for the 2025 to 2026
          season.
        </p>
      </div>
    </Section>
  );
}
