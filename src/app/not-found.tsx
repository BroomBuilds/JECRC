import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="u-label text-crimson">Error 404</p>
      <h1 className="u-display mt-6 max-w-[16ch] text-[2.5rem] leading-[1.02] text-paper sm:text-[3.5rem]">
        That page is not here
      </h1>
      <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.85] text-mist">
        It may have moved to one of the campus sites. Start again from the top, or head straight to
        admissions.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="u-label rounded-full bg-crimson px-7 py-3.5 text-white transition-colors duration-300 hover:bg-crimson-lit"
        >
          Back to the start
        </Link>
        <Link
          href="/#admissions"
          className="u-label rounded-full border border-line px-7 py-3.5 text-mist transition-colors duration-300 hover:border-white/35 hover:text-paper"
        >
          Admissions
        </Link>
      </div>
    </main>
  );
}
