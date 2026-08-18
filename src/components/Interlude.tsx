"use client";

import { useRef } from "react";
import { INTERLUDE } from "@/lib/content";
import { STILL } from "@/lib/assets";
import { useSectionProgress } from "@/lib/useSectionProgress";

export default function Interlude() {
  const section = useRef<HTMLElement>(null);
  const bg = useRef<HTMLDivElement>(null);
  useSectionProgress(section, (p) => {
    if (bg.current) bg.current.style.transform = `translate3d(0, ${(p - 0.5) * 13}%, 0)`;
  }, { mode: "through" });

  return (
    <section ref={section} className="relative isolate flex h-[110vh] items-center justify-center overflow-hidden bg-ink grain">
      <div ref={bg} className="absolute inset-x-0 -top-[14%] -bottom-[14%] -z-10 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={STILL.five} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      </div>

      <div className="px-6 text-center">
        <p data-reveal className="label text-crimson-pale/85">{INTERLUDE.eyebrow}</p>
        <h2 data-reveal="mask" style={{ ["--d" as string]: "140ms" }} className="display mt-8 text-[10.5vw] leading-[1.05] text-paper sm:text-[7vw] lg:text-[5vw]">
          {INTERLUDE.headline}
        </h2>
        <p data-reveal style={{ ["--d" as string]: "340ms" }} className="script mt-3 text-[11vw] text-crimson-soft sm:text-[7.5vw] lg:text-[5vw]">
          {INTERLUDE.script}
        </p>
      </div>
    </section>
  );
}
