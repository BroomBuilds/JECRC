import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="u-eyebrow text-crimson">Error 404</p>
      <h1 className="u-serif mt-6 max-w-[15ch] text-[2.75rem] text-ink sm:text-[3.75rem]">
        That page is not here
      </h1>
      <p className="mt-7 max-w-[46ch] text-[16px] leading-[1.7] text-graphite">
        It may have moved to one of the campus sites. Start again from the top, or head straight to
        admissions.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="u-pill border-crimson bg-crimson text-paper hover:bg-crimson-deep">
          Back to the start
        </Link>
        <Link
          href="/#admissions"
          className="u-pill border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-paper"
        >
          Admissions
        </Link>
      </div>
    </main>
  );
}
