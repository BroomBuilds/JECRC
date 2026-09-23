"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { FAQS } from "@/lib/content/faq";
import { CONTACT, LOGO } from "@/lib/content/site";
import { APPLY_LINKS } from "@/lib/content/universities";
import { cn } from "@/lib/utils/cn";
import { Plus } from "@/components/ui/Icons";

/**
 * Frequently asked.
 *
 * Two columns on white: the copy holds the left and stays put while the thread
 * runs down the right. Centring the header over a full-width list made the eye
 * travel to the middle, then back to the left edge, then down; anchoring the
 * argument on one side and the answers on the other is one movement.
 *
 * A question hugs its text, the answer arrives underneath with the crest as
 * the speaker, and the tail corner is squared on each so the pair reads as a
 * thread rather than two cards.
 *
 * Both the bubble and the plus toggle the row.
 *
 * Open and close animates `grid-template-rows` from 0fr to 1fr rather than a
 * max-height guess, so the panel travels to its exact height and a long answer
 * never clips or snaps. One open at a time. The same copy is mirrored into
 * FAQPage JSON-LD in lib/seo/schema.ts.
 */
export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section
      id="faq"
      style={{ scrollMarginTop: "6.5rem" }}
      className="relative overflow-hidden bg-paper py-16 md:py-28 lg:py-32"
    >
      <div className="u-shell grid gap-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-20">
        {/* ---- the argument, held on the left ---- */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p data-reveal className="u-eyebrow text-crimson">
            Questions
          </p>
          <h2
            data-reveal
            style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
            className="u-display mt-5 max-w-[11ch] text-[2rem] text-ink sm:mt-6 sm:text-[2.9rem] lg:text-[clamp(3rem,3.8vw,4rem)]"
          >
            Ask us <span className="u-display-strong text-crimson">anything</span>
          </h2>
          <p
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="mt-6 max-w-[34ch] text-[15.5px] leading-[1.7] text-graphite md:mt-7 md:text-[16px]"
          >
            The eight things people ask before they apply, answered in full. Anything else and the
            admissions desk picks up.
          </p>

          <div
            data-reveal
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a
              href={APPLY_LINKS[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="u-pill border-crimson bg-crimson text-paper hover:bg-crimson-deep"
            >
              Start an application
            </a>
            <a
              href={CONTACT.admissionsPhoneHref}
              className="u-pill border-ink/15 bg-bone text-ink hover:border-crimson hover:text-crimson"
            >
              Talk to admissions
            </a>
          </div>
        </div>

        {/* ---- the thread, on the right ---- */}
        <ul className="flex flex-col gap-4">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            const panelId = `${uid}-${i}`;
            const toggle = () => setOpen(isOpen ? null : i);

            return (
              <li key={f.q}>
                <div
                  data-reveal
                  style={{ "--reveal-delay": `${i * 40}ms` } as React.CSSProperties}
                  className="flex items-center gap-3"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={toggle}
                    className={cn(
                      "min-w-0 flex-1 rounded-3xl rounded-bl-md px-6 py-4 text-left text-[15px] font-semibold leading-snug transition-colors duration-300 md:text-[17px]",
                      isOpen ? "bg-crimson text-paper" : "bg-ink text-paper hover:bg-crimson"
                    )}
                  >
                    {f.q}
                  </button>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={toggle}
                    aria-label={isOpen ? `Close: ${f.q}` : `Open: ${f.q}`}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                      isOpen
                        ? "bg-crimson text-paper"
                        : "bg-bone text-ink hover:bg-ink hover:text-paper"
                    )}
                  >
                    <Plus
                      className={cn(
                        "h-4 w-4 transition-transform duration-500 ease-out-expo",
                        isOpen && "rotate-45"
                      )}
                    />
                  </button>
                </div>

                {/* 0fr to 1fr so the panel travels to its real height. The
                    inner element carries the fade and the lift on a slightly
                    longer curve, which makes it read as arriving rather than
                    unrolling. */}
                <div
                  id={panelId}
                  role="region"
                  aria-label={f.q}
                  inert={!isOpen}
                  className="grid transition-[grid-template-rows] duration-[550ms] ease-out-expo"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      className={cn(
                        "flex items-end gap-3 pr-12 pt-3 transition-[opacity,transform] duration-500 ease-out-expo",
                        isOpen ? "translate-y-0 opacity-100 delay-100" : "translate-y-2 opacity-0"
                      )}
                    >
                      <span className="hidden h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rule bg-paper sm:flex">
                        <Image
                          src={LOGO.crest}
                          alt=""
                          width={80}
                          height={89}
                          className="h-5 w-auto object-contain"
                        />
                      </span>
                      <p className="rounded-3xl rounded-bl-md bg-bone px-6 py-5 text-[14.5px] leading-[1.7] text-graphite md:text-[15.5px]">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
