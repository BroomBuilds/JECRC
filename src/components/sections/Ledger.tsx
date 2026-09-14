import Image from "next/image";
import { CONTEXT, LEDGER, RECRUITERS, SEASON } from "@/lib/content/numbers";

/**
 * The record.
 *
 * ---- what this band is for ----
 *
 * Not to be loud. A number set in 160px type is a claim, and a claim is not
 * evidence. But the opposite mistake is real too: the season drawn as two
 * thousand small squares was evidence nobody could take in, a grey texture that
 * asked to be counted and could not be. Both failures come from the same place,
 * which is deciding the FORM before deciding the argument.
 *
 * The argument is two sentences long. Two thousand one hundred and four offers
 * is about nine a day, every day, for most of a year. Four in ten of them came
 * from a Fortune 500 company. So the band is those two sentences, drawn: the
 * count at the size the count deserves, and one run underneath it broken where
 * the Fortune 500 share ends.
 *
 * ---- one language, twice ----
 *
 * The run here and the four runs in "What they paid" are the same object drawn
 * to different units — a length that starts at the left edge and stops where
 * the quantity stops, labelled at the point it stops. Nothing on this page has
 * to be read twice to be understood the second time. The squares were a second
 * vocabulary that meant the same thing as the first, and the section paid for
 * it in both bytes and attention.
 */

/**
 * The season, split where the Fortune 500 share falls.
 *
 * ---- two columns, not one bar ----
 *
 * A single bar cut at 40.7% told the ratio and then had nothing else to do
 * with the rest of the band: the counts hung underneath it on absolute
 * positions and the marks of the companies that made the offers were four
 * hundred pixels further down the page in a marquee, unconnected to either
 * number.
 *
 * So the split is the LAYOUT now. Two columns whose widths are 856 and 1,248
 * of flex-grow, which is to say the columns are the data — and each one holds
 * its own filled rule, its own count, and the marks of the companies that came
 * under that heading. The proportion is stated three times in the same object:
 * once by the widths, once by the rules, once by the figures. Nothing has to
 * be carried across the page in a reader's head.
 *
 * The marks are the point of the second half. "1,248 from everyone else" is a
 * remainder until you see that everyone else is Deloitte and PwC, at which
 * point it stops reading as the leftovers.
 */
function SeasonSplit() {
  const rest = SEASON.offers - SEASON.fortune500;
  const f500 = RECRUITERS.filter((r) => r.f500);
  const others = RECRUITERS.filter((r) => !r.f500);

  const groups = [
    {
      key: "share" as const,
      grow: SEASON.fortune500,
      count: SEASON.fortune500,
      of: "from Fortune 500 companies",
      // Enough marks to be recognised, not enough to become a second
      // marquee. The full list is under "Who came to campus" below.
      logos: f500.slice(0, 5),
      delay: "140ms",
    },
    {
      key: "rest" as const,
      grow: rest,
      count: rest,
      of: "from everyone else",
      logos: others.slice(0, 7),
      delay: "620ms",
    },
  ];

  return (
    <div data-reveal="fill" className="u-season">
      {groups.map((g) => (
        <div
          key={g.key}
          className="u-season-col"
          data-tone={g.key}
          style={{ flex: `${g.grow} 1 0`, "--reveal-delay": g.delay } as React.CSSProperties}
        >
          {/* The rule draws left to right, crimson first and ink picking up
              where it stopped, so the two columns read as one sweep across the
              season rather than as two bars racing each other. */}
          <span aria-hidden className="u-season-rule" />

          <p className="u-season-count u-rec-tab">{g.count.toLocaleString("en-IN")}</p>
          <p className="u-season-of">{g.of}</p>

          <ul className="u-season-logos">
            {g.logos.map((r) => (
              <li key={r.slug}>
                <Image
                  src={`/media/recruiters/${r.slug}.webp`}
                  alt={r.name}
                  width={480}
                  height={120}
                  className="u-season-logo"
                  style={{ "--s": r.scale } as React.CSSProperties}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function Ledger() {
  return (
    <section
      id="numbers"
      aria-labelledby="record-title"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-paper py-16 md:py-24 lg:py-28"
    >
      {/* ---- the season ---- */}
      <div className="u-shell">
        {/* Heading, then the line under it. They were sharing a row and it
            read as a masthead with a stray column of body copy pinned to the
            right of it — a heading and its own subtitle belong on the same
            axis, one above the other, at every width.

            The heading still holds one line from md up: it was breaking across
            two with room to spare on the right, which is two rows of type
            doing the work of one. */}
        <h2
          id="record-title"
          className="u-display text-[2rem] text-ink sm:text-[2.9rem] md:whitespace-nowrap md:text-[clamp(2.6rem,4.6vw,4.5rem)]"
        >
          {LEDGER.title}
        </h2>

        <p className="mt-5 max-w-[58ch] text-[15.5px] leading-[1.7] text-graphite md:mt-6 md:text-[17px]">
          {LEDGER.lead}
        </p>

        {/* The count, at the size a count that large is owed, and the fact
            that makes it holdable set beside it.

            2,104 alone is weather. About nine a day is someone getting an
            offer, twice before lunch, every day, for most of a year — and the
            arithmetic is just 2,104 over the season's 230 days, both published.
            The figure and the sentence share a baseline and sit against each
            other, not at opposite ends of the shell: the sentence opens with
            the word "offers", so it is the rest of a phrase the number starts,
            and a phrase with four hundred pixels in the middle of it is two
            things. */}
        <div className="mt-12 md:mt-16 lg:flex lg:items-end lg:gap-10 xl:gap-14">
          <p className="u-season-total u-rec-tab">{SEASON.offers.toLocaleString("en-IN")}</p>
          <p className="u-rec-rate mt-5 max-w-[26ch] lg:mt-0 lg:max-w-[30ch] lg:pb-3">
            offers, which is about <b>nine a day</b> across the season&rsquo;s {SEASON.days} days
            of campus recruitment.
          </p>
        </div>

        <SeasonSplit />
      </div>

      {/* ---- what they paid ----
          Its own band, on bone, full bleed. As a hairline between two blocks of
          type it was the smallest thing in the section and the most useful, and
          the most decision-relevant fact on the page should not be the quietest
          mark on it.

          The rail is gone. It was three points pinned to an axis whose top was
          the highest package, and that construction only holds while the top
          and the bottom are the same order of magnitude — put a crore-sized
          offer on it and three of the four values collapse into the left
          margin. What replaced it is not a smaller version of the same idea: it
          is the money itself, one mark per ₹1,00,000, run out at true length
          under each other. Zero-based by construction rather than by choice,
          nothing normalised against anything, and the sixfold spread it could
          not survive is now the thing it shows. Same object as the season's run
          in the band above, drawn to a different unit. */}
      <div className="mt-16 bg-bone py-14 md:mt-24 md:py-20">
        <div className="u-shell">
          {/* Heading, then the line under it, on one axis. A subheading set
              off to the right of its own heading reads as a masthead with a
              stray column of body copy pinned beside it — the two belong on
              the same left edge, one above the other, at every width. */}
          <h3 className="u-display text-[1.6rem] text-ink md:text-[2.2rem]">What they paid</h3>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-[1.65] text-graphite md:mt-5 md:text-[16px]">
            Cost to company, {SEASON.pay.unit}, offered in the {SEASON.year} season. Most land near
            the average; the top of the range is one offer, not the shape of them.
          </p>

          {/* Wide screens get the marks. Below md the run is six hundred pixels
              across and one mark is four of them, which is a texture rather
              than something anyone can count, so the phone gets the same
              proportions as plain bars. */}
          <ol data-reveal="fill" className="u-pay-runs mt-12 hidden md:block lg:mt-16">
            {SEASON.pay.marks.map((m, i) => (
              <li
                key={m.value}
                className="u-pay-row"
                data-top={i === SEASON.pay.marks.length - 1 ? "" : undefined}
              >
                <span className="u-pay-label">{m.label}</span>
                {/* The value is placed at the point the run stops, not at the
                    far side of the row. Across fourteen hundred pixels a label
                    on the left and a figure on the right are two things a
                    reader has to pair up by hand; on the tip of its own run the
                    figure IS the length, and the run draws toward it. */}
                <div
                  className="u-pay-plot"
                  style={
                    {
                      "--frac": `${(m.lakh / SEASON.pay.scale) * 100}%`,
                      "--pitch": `${100 / SEASON.pay.scale}%`,
                      "--reveal-delay": `${120 + i * 130}ms`,
                    } as React.CSSProperties
                  }
                >
                  <span aria-hidden className="u-pay-run" />
                  <span className="u-pay-value u-figure u-rec-tab">{m.value}</span>
                </div>
              </li>
            ))}
          </ol>

          <ul data-reveal="fill" className="mt-10 flex flex-col gap-7 md:hidden">
            {SEASON.pay.marks.map((m, i) => (
              <li key={m.value} data-top={i === SEASON.pay.marks.length - 1 ? "" : undefined}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] text-graphite">{m.label}</span>
                  <span className="u-figure u-rec-tab text-[1.45rem] text-ink">{m.value}</span>
                </div>
                <span aria-hidden className="u-rec-bar mt-3">
                  <span
                    className="u-rec-bar-fill"
                    style={
                      {
                        "--frac": `${(m.lakh / SEASON.pay.scale) * 100}%`,
                        "--reveal-delay": `${120 + i * 130}ms`,
                      } as React.CSSProperties
                    }
                  />
                </span>
              </li>
            ))}
          </ul>

        </div>
      </div>

      <div className="u-shell">
        {/* ---- who came ----
            Marks, and only marks. Every one of these logos is a wordmark or
            carries its own name inside it, so setting the name beside it in DM
            Sans said everything twice and in two voices. The name lives in the
            alt text, where it is read by the people who cannot see the mark
            and by nobody else.

            Heights are optical rather than equal: see `scale` in
            content/numbers.ts. */}
        <div className="mt-16 md:mt-24">
          <h3 className="u-display text-[1.6rem] text-ink md:text-[2.2rem]">Who came to campus</h3>

          <div
            className="u-marquee relative mt-9 overflow-hidden"
            // Edges fade rather than cut, so the loop has no visible seam.
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
            }}
          >
            <ul
              className="u-marquee-track"
              style={{ "--marquee-duration": "64s" } as React.CSSProperties}
            >
              {/* Two copies: the animation translates by -50%, so the second
                  lands exactly where the first began. The gap lives inside each
                  copy as trailing padding rather than on the track, otherwise
                  half a gap of drift shows at the loop point. The duplicate is
                  decorative, so it is hidden from assistive tech. */}
              {[0, 1].map((copy) => (
                <li key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-9 pr-9 md:gap-12 md:pr-12">
                  {RECRUITERS.map((r) => (
                    <Image
                      key={`${copy}-${r.slug}`}
                      src={`/media/recruiters/${r.slug}.webp`}
                      // Named on the second copy too would double every
                      // company for a screen reader; the duplicate list is
                      // already aria-hidden.
                      alt={r.name}
                      width={480}
                      height={120}
                      // Eager, at the lowest priority the platform offers.
                      //
                      // Lazy is the wrong default for a marquee. These logos
                      // sit on a track five thousand pixels wide that is
                      // translated past a narrow window, so a lazy one is
                      // requested at the moment it slides into view and arrives
                      // some time after — on a 1.6 Mbps phone, nine of the
                      // forty-two had loaded after sixteen seconds and gaps
                      // rode through the window continuously.
                      //
                      // Eager asks for all twenty during parse instead. They
                      // are tiny (340 KB the lot, and the duplicate copy is the
                      // same twenty URLs out of cache), and `fetchPriority`
                      // low keeps them behind the poster and the film so
                      // nothing above the fold waits on them.
                      loading={copy === 0 ? "eager" : "lazy"}
                      fetchPriority="low"
                      className="u-rec-co"
                      style={{ "--s": r.scale } as React.CSSProperties}
                    />
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- beyond the season ----
            Tabular figures in a real column. `font-variant-numeric` is not a
            flourish here: it is what lets eight values of different widths line
            up on their last digit, which is the whole reason a ledger is set as
            a ledger. */}
        <div className="mt-16 border-t border-rule pt-10 md:mt-24 md:pt-12">
          <h3 className="u-grotesk text-[1.35rem] text-ink md:text-[1.6rem]">
            Beyond the season
          </h3>

          <dl className="mt-7 grid gap-x-16 sm:grid-cols-2">
            {CONTEXT.map((c) => (
              <div
                key={c.label}
                className="flex items-baseline justify-between gap-6 border-b border-rule py-3.5"
              >
                <dt className="text-[14.5px] text-graphite">{c.label}</dt>
                <dd className="u-rec-tab text-[1.05rem] font-semibold text-ink">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-10 max-w-[70ch] text-[13px] leading-[1.65] text-quiet">
          Recruiters as named on the university placements page, each mark the trademark of its
          owner. Placement figures are for the {SEASON.year} season, group totals across both
          campuses.
        </p>
      </div>
    </section>
  );
}
