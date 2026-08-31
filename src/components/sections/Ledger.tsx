import { FIGURES, LEDGER, RECRUITERS } from "@/lib/content/numbers";
import { Eyebrow } from "@/components/ui/Section";

/**
 * The record.
 *
 * One band where there used to be three, each of which was a row of stats under
 * a heading. Three rows of stats is not three arguments, it is one argument
 * told badly.
 *
 * The hierarchy does the work rather than the decoration. Two `lead` figures
 * run at display size across the top with a hairline between them; six `mid`
 * figures sit in a grid below; the rest are `unit` and set as a dense ledger,
 * which is how a set of numbers should look when the point is that there are a
 * lot of them and they all check out. Every value is as published.
 */
export default function Ledger() {
  const lead = FIGURES.filter((f) => f.scale === "lead");
  const mid = FIGURES.filter((f) => f.scale === "mid");
  const unit = FIGURES.filter((f) => f.scale === "unit");

  return (
    <section
      id="numbers"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-paper py-20 md:py-24 lg:py-28"
    >
      <div className="u-shell">
        <div data-reveal>
          <Eyebrow>{LEDGER.eyebrow}</Eyebrow>
        </div>

        {/* The heading takes the whole shell so it can hold one line from md
            up. It needs every pixel of that width: sharing the row with the
            lead paragraph left it 800px to fill 1,200 and it ran straight
            underneath the copy. The clamp is tuned to fit the longest the
            string gets at every width above md; below that it wraps. */}
        <h2
          data-reveal
          style={{ "--reveal-delay": "70ms" } as React.CSSProperties}
          className="u-display mt-6 text-[2.25rem] text-ink md:whitespace-nowrap md:text-[clamp(2.4rem,5.9vw,5.75rem)]"
        >
          What twenty-six years{" "}
          <span className="u-display-strong text-crimson">adds up to</span>
        </h2>

        <p
          data-reveal
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
          className="mt-8 max-w-[56ch] text-[16px] leading-[1.7] text-graphite md:text-[17px]"
        >
          {LEDGER.lead}
        </p>

        {/* ---- the two that matter most ---- */}
        <dl className="mt-14 grid border-y border-rule md:mt-16 md:grid-cols-2">
          {lead.map((f, i) => (
            <div
              key={f.label}
              data-reveal
              style={{ "--reveal-delay": `${i * 100}ms` } as React.CSSProperties}
              className="border-b border-rule py-12 last:border-b-0 md:border-b-0 md:py-16 md:odd:border-r md:odd:pr-12 md:even:pl-12"
            >
              <dd className="u-figure text-[19vw] text-ink sm:text-[13vw] lg:text-[clamp(6rem,9vw,10.5rem)]">
                {f.value}
                {f.unit && <span className="text-crimson">{f.unit}</span>}
              </dd>
              <dt className="u-grotesk mt-6 text-[1.35rem] text-ink md:text-[1.6rem]">{f.label}</dt>
              {f.detail && (
                <p className="mt-3 max-w-[34ch] text-[14.5px] leading-[1.65] text-quiet">
                  {f.detail}
                </p>
              )}
            </div>
          ))}
        </dl>

        {/* ---- the supporting six ----
            Dividers are borders on the cells, not a background showing through
            1px gaps. The cells fade in one after another, and a background
            behind them reads as a solid grey block until the last one lands. */}
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
          {mid.map((f, i) => (
            <div
              key={f.label}
              data-reveal
              style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
              className="group border-b border-rule py-10 transition-colors duration-500 hover:bg-bone sm:odd:border-r sm:odd:pr-6 sm:even:pl-6 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0 lg:odd:pr-6 lg:even:pl-6"
            >
              <dd className="u-figure text-[3.25rem] text-ink md:text-[4rem]">
                {f.value}
                {f.unit && <span className="text-crimson">{f.unit}</span>}
              </dd>
              <dt className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {f.label}
              </dt>
              {f.detail && (
                <p className="mt-2 max-w-[30ch] text-[13.5px] leading-[1.6] text-quiet">
                  {f.detail}
                </p>
              )}
            </div>
          ))}
        </dl>

        {/* ---- everything else, as a ledger ---- */}
        <dl className="mt-4 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {unit.map((f, i) => (
            <div
              key={f.label}
              data-reveal
              style={{ "--reveal-delay": `${i * 40}ms` } as React.CSSProperties}
              className="flex items-baseline justify-between gap-4 border-b border-rule py-4"
            >
              <dt className="text-[14px] text-quiet">{f.label}</dt>
              <dd className="u-figure text-[1.15rem] text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>

        {/* ---- who came ---- */}
        <div className="mt-16 md:mt-20">
          <p data-reveal className="u-eyebrow text-quiet">
            Who came to campus
          </p>

          <div
            className="u-marquee relative mt-8 overflow-hidden"
            // Edges fade rather than cut, so the loop has no visible seam.
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)",
            }}
          >
            <ul
              className="u-marquee-track"
              style={{ "--marquee-duration": "58s" } as React.CSSProperties}
            >
              {/* Two copies: the animation translates by -50%, so the second
                  lands exactly where the first began. The gap lives inside each
                  copy as trailing padding rather than on the track, otherwise
                  half a gap of drift shows at the loop point. The duplicate is
                  decorative, so it is hidden from assistive tech. */}
              {[0, 1].map((copy) => (
                <li key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-10 pr-10">
                  {RECRUITERS.map((name) => (
                    <span
                      key={`${copy}-${name}`}
                      className="u-grotesk whitespace-nowrap text-[1.5rem] text-ink/25 transition-colors md:text-[2rem]"
                    >
                      {name}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-[13px] text-quiet">
            Recruiters as named on the university placements page. Figures are for the 2025 to 2026
            season.
          </p>
        </div>
      </div>
    </section>
  );
}
