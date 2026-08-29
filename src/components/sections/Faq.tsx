import { FAQS } from "@/lib/content/faq";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Plus } from "@/components/ui/Icons";

/**
 * Frequently asked.
 *
 * Built on native <details>, which brings keyboard support, the correct
 * expanded state for screen readers and in-page find for free. A hand-rolled
 * accordion would be more code and less accessible.
 *
 * The same answers are mirrored into FAQPage JSON-LD in lib/seo/schema.ts, and
 * they are written to survive being quoted on their own: complete sentences,
 * no back-references.
 */
export default function Faq() {
  return (
    <Section id="faq" tone="ink">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        <SectionHeading
          eyebrow="Questions"
          title={
            <>
              The things people{" "}
              <span className="u-display-italic text-crimson">actually ask</span>
            </>
          }
          lead="Admissions, placements, recognition and scholarships, answered in full."
        />

        <div className="border-t border-line">
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              data-reveal
              style={{ "--reveal-delay": `${i * 50}ms` } as React.CSSProperties}
              className="group border-b border-line"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-[15.5px] font-semibold leading-snug text-paper transition-colors duration-300 hover:text-crimson md:text-[17px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="mt-1 h-4 w-4 shrink-0 text-crimson transition-transform duration-400 ease-out-expo group-open:rotate-45" />
              </summary>
              <p className="max-w-[62ch] pb-7 text-[14.5px] leading-[1.85] text-mist">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
