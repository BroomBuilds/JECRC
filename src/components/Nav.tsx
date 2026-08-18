"use client";

import { useEffect, useState } from "react";
import { BRAND, NAV } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? "bg-ink/85 backdrop-blur-xl border-b border-white/[0.07] py-4" : "bg-transparent py-7"
      }`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 md:px-12">
        <a href="#top" className="display text-paper text-[13px] tracking-[0.3em] uppercase md:text-[15px]">
          {BRAND.wordmark}
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="label link-underline text-sand/85 transition-colors duration-500 hover:text-crimson-pale">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a href="#visit" className="label hidden border border-crimson/50 px-6 py-3 text-crimson-pale transition-colors duration-500 hover:border-crimson hover:bg-crimson/10 md:inline-block">
            Apply
          </a>
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open} className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden">
            <span className={`block h-px w-6 bg-paper transition-transform duration-500 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-paper transition-transform duration-500 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      <div className={`overflow-hidden transition-[max-height,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <nav className="flex flex-col gap-5 border-t border-white/10 bg-ink/95 px-6 py-8 backdrop-blur-xl">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="label text-sand">{item.label}</a>
          ))}
          <a href="#visit" onClick={() => setOpen(false)} className="label text-crimson-pale">Apply</a>
        </nav>
      </div>
    </header>
  );
}
