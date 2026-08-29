"use client";

import { useRef } from "react";
import { LEGACY, STATS } from "@/lib/content";
import { STILL } from "@/lib/assets";
import { useSectionProgress } from "@/lib/useSectionProgress";

export default function Legacy() {
  const section = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  useSectionProgress(section, (p) => {
    if (bg.current) bg.current.style.transform = `translate3d(0, ${(p - 0.5) * 9}%, 0)`;
  }, { mode: "through" });

  return (
    <section ref={section} id="university" className="relative isolate overflow-hidden bg-paper py-28 text-ink md:py-40">
      <div ref={bg} className="absolute inset-x-0 -top-[12%] -bottom-[12%] -z-10 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={STILL.two} alt="" className="h-full w-full object-cover opacity-[0.2]" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/70 to-paper" />
      </div>

      <div className="mx-auto w-full max-w-[1180px] px-6 text-center md:px-12">
        <p data-reveal className="label text-ink/45">{LEGACY.eyebrow}</p>

        <h2 className="display mt-8 text-[11vw] leading-[1.04] sm:text-[7.5vw] lg:text-[5.2vw]">
          <span data-reveal="mask" className="ghost-stack block">
            <span aria-hidden className="ghost">{LEGACY.headline}</span>
            {LEGACY.headline}
          </span>
          <span data-reveal="mask" style={{ ["--d" as string]: "180ms" }} className="script mt-1 block text-[12vw] leading-[1.1] text-crimson sm:text-[8vw] lg:text-[5.6vw]">
            {LEGACY.headlineScript}
          </span>
        </h2>

        <p data-reveal style={{ ["--d" as string]: "320ms" }} className="mx-auto mt-12 max-w-[64ch] text-[15px] leading-[2] font-light text-ink/70 md:text-base">
          {LEGACY.body}
        </p>

        <div data-reveal style={{ ["--d" as string]: "440ms" }} className="mt-14">
          <a href="#schools" className="label link-underline inline-block text-ink/70 hover:text-ink">{LEGACY.cta}</a>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-ink/12 pt-12 md:mt-28 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} data-reveal style={{ ["--d" as string]: `${i * 100}ms` }}>
              <p className="display flex items-baseline justify-center gap-[0.1em] text-[10vw] leading-none sm:text-[5vw] lg:text-[3.4vw]">
                {s.value}<span className="text-[0.42em] text-crimson">{s.unit}</span>
              </p>
              <p className="label mx-auto mt-4 max-w-[20ch] text-ink/45">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
