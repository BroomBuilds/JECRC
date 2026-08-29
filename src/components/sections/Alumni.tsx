import Image from "next/image";
import { ALUMNI_NETWORK, ALUMNI_PROFILES } from "@/lib/content/alumni";
import { Section, SectionHeading } from "@/components/ui/Section";

/**
 * Alumni.
 *
 * The network pillars are always shown; the profile grid appears only once
 * `ALUMNI_PROFILES` has entries. Named graduates need consent and licensed
 * photography, so the section is built to be complete without them and to grow
 * the grid the moment they land, with no change here.
 */
export default function Alumni() {
  return (
    <Section id="alumni" tone="void">
      <SectionHeading
        eyebrow={ALUMNI_NETWORK.eyebrow}
        title={
          <>
            Thirty-four thousand people{" "}
            <span className="u-display-italic text-crimson">who were here first</span>
          </>
        }
        lead={ALUMNI_NETWORK.body}
      />

      <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ALUMNI_NETWORK.pillars.map((p, i) => (
          <li
            key={p.label}
            data-reveal
            style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            className="flex flex-col rounded-2xl border border-line bg-surface p-8 transition-colors duration-500 hover:border-crimson/40"
          >
            <p className="u-figure text-[2.75rem] text-paper md:text-[3.25rem]">{p.value}</p>
            <p className="u-label mt-4 text-crimson">{p.label}</p>
            <p className="mt-4 text-[13.5px] leading-[1.75] text-mist">{p.detail}</p>
          </li>
        ))}
      </ul>

      {ALUMNI_PROFILES.length > 0 && (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ALUMNI_PROFILES.map((a, i) => (
            <li
              key={a.name}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
              className="group overflow-hidden rounded-2xl border border-line bg-surface"
            >
              {a.portrait && (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={a.portrait}
                    alt={a.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 92vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-7">
                <p className="u-display text-[1.4rem] leading-tight text-paper">{a.name}</p>
                <p className="mt-2 text-[13px] text-crimson">{a.now}</p>
                <p className="mt-4 text-[12.5px] text-dim">
                  {a.school} · {a.cohort}
                </p>
                {a.line && <p className="mt-4 text-[13.5px] leading-[1.75] text-mist">{a.line}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
