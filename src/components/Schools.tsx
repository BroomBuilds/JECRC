"use client";

import { useRef, useState } from "react";
import { SCHOOLS, ALL_SCHOOLS } from "@/lib/content";
import { useSectionProgress } from "@/lib/useSectionProgress";

export default function Schools() {
  const root = useRef<HTMLElement>(null);
  const zoom = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const [idx, setIdx] = useState(0);
  const n = SCHOOLS.length;
  const last = useRef(-1);

  useSectionProgress(root, (p) => {
    const pos = Math.min(0.9999, p) * n;
    const i = Math.floor(pos);
    const f = pos - i;
    if (i !== last.current) { last.current = i; setIdx(i); }
    if (zoom.current) zoom.current.style.transform = `scale(${1.09 - f * 0.09}) translate3d(0, ${(f - 0.5) * 2}%, 0)`;
    if (rail.current) rail.current.style.transform = `scaleX(${p})`;
  });

  return (
    <section ref={root} id="schools" className="relative bg-ink" style={{ height: `${(n + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden grain">
        <div ref={zoom} className="absolute inset-0 will-change-transform">
          {SCHOOLS.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.name}
              src={s.image}
              alt={s.name}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ opacity: i === idx ? 1 : 0 }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-ink/78 to-ink/25 lg:via-ink/58" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />

        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12">
            <div className="max-w-[46rem]">
              <p className="label text-crimson-pale/85">Eleven Schools</p>
              <h2 className="display mt-3 text-[13vw] leading-[0.92] text-paper sm:text-[8vw] lg:text-[5.2vw]">
                Ways <span className="script pr-2 text-crimson">in</span>
              </h2>
              <span className="mt-8 block h-px w-24 bg-crimson/50" />

              <div className="relative mt-10 min-h-[16rem] sm:min-h-[15rem]">
                {SCHOOLS.map((s, i) => (
                  <div
                    key={s.name}
                    className="absolute inset-0 transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ opacity: i === idx ? 1 : 0, transform: i === idx ? "none" : "translateY(22px)", pointerEvents: i === idx ? "auto" : "none" }}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="display text-2xl text-crimson-soft/80">{s.index}</span>
                      <span className="label text-sand/70">{s.eyebrow}</span>
                    </div>
                    <h3 className="display mt-3 text-[8.5vw] leading-[1.05] text-paper sm:text-[5vw] lg:text-[3.2vw]">
                      {s.name}
                    </h3>
                    <p className="mt-5 max-w-[50ch] text-[14px] leading-[1.95] font-light text-sand/80 md:text-[15px]">{s.body}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-6">
                      <span className="label text-sand/60">{s.meta}</span>
                      <span className="h-px w-14 bg-crimson/50" />
                      <a href="#visit" className="label link-underline text-crimson-pale">Explore</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-6 pb-8 md:px-12">
            <div className="hidden gap-6 sm:flex">
              {SCHOOLS.map((s, i) => (
                <span key={s.index} className={`label transition-colors duration-700 ${i === idx ? "text-crimson-pale" : "text-sand/30"}`}>{s.index}</span>
              ))}
            </div>
            <div className="relative h-px flex-1 bg-white/12">
              <span ref={rail} className="absolute inset-0 origin-left bg-crimson" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* the full list, for anyone who wants it plainly */}
      <div className="sr-only">{ALL_SCHOOLS.join(", ")}</div>
    </section>
  );
}
