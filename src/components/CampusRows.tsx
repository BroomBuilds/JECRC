import { CAMPUS } from "@/lib/content";

export default function CampusRows() {
  return (
    <section id="campus" className="relative bg-paper py-28 text-ink md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="max-w-[52rem]">
          <p data-reveal className="label text-ink/45">Campus Life</p>
          <h2 data-reveal="mask" style={{ ["--d" as string]: "120ms" }} className="display mt-4 text-[12vw] leading-[0.95] sm:text-[7.5vw] lg:text-[5vw]">
            A campus you use, <span className="script text-crimson">not one you tour.</span>
          </h2>
        </div>

        <div className="mt-24 space-y-28 md:mt-32 md:space-y-40">
          {CAMPUS.map((d, i) => (
            <article key={d.name} className={`grid items-center gap-10 md:grid-cols-12 md:gap-16 ${i % 2 ? "md:[direction:rtl]" : ""}`}>
              <div className={`md:col-span-7 ${i % 2 ? "md:[direction:ltr]" : ""}`}>
                <div data-reveal="wipe" className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.image} alt={d.name} className="aspect-[4/3] w-full object-cover shadow-[0_40px_90px_-40px_rgba(40,10,10,0.5)]" />
                </div>
              </div>
              <div className={`md:col-span-5 ${i % 2 ? "md:[direction:ltr]" : ""}`}>
                <p data-reveal className="label text-ink/45">{d.eyebrow}</p>
                <h3 data-reveal="mask" style={{ ["--d" as string]: "120ms" }} className="ghost-stack display mt-3 text-[9vw] leading-[1.05] sm:text-[5vw] lg:text-[3.1vw]">
                  <span aria-hidden className="ghost">{d.name}</span>
                  {d.name}
                </h3>
                <p data-reveal style={{ ["--d" as string]: "260ms" }} className="mt-6 max-w-[48ch] text-[15px] leading-[2] font-light text-ink/65">{d.body}</p>
                <div data-reveal style={{ ["--d" as string]: "380ms" }} className="mt-9">
                  <a href="#visit" className="label link-underline text-ink/70 hover:text-ink">{d.cta}</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
