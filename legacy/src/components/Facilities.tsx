import { FACILITIES } from "@/lib/content";

export default function Facilities() {
  return (
    <section id="facilities" className="relative bg-maroon-deep py-28 grain md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal className="label text-crimson-pale/85">Facilities</p>
            <h2 data-reveal="mask" style={{ ["--d" as string]: "120ms" }} className="display mt-4 text-[11vw] leading-[0.95] text-paper sm:text-[7vw] lg:text-[4.4vw]">
              Built to be <span className="script text-crimson-soft">used.</span>
            </h2>
          </div>
          <p data-reveal style={{ ["--d" as string]: "240ms" }} className="max-w-[40ch] text-[14px] leading-[2] font-light text-sand/65">
            Thirty-two acres of it, most of which is booked out by students most evenings. Everything below is included in your fees.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3 md:gap-8">
          {FACILITIES.map((a, i) => (
            <article key={a.title} data-reveal style={{ ["--d" as string]: `${i * 130}ms` }} className="group relative overflow-hidden border border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.image} alt={a.title} className="aspect-[3/4] w-full object-cover opacity-60 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-9">
                <h3 className="display text-[7vw] leading-tight text-paper sm:text-[3vw] lg:text-[1.75vw]">{a.title}</h3>
                <p className="mt-3 max-w-[34ch] text-[13px] leading-[1.9] font-light text-sand/70">{a.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
