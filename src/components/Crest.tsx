type Props = { className?: string; strokeWidth?: number };

/**
 * Academic emblem — placeholder. Replace with JECRC's official logo SVG when
 * you have it; everything here uses `currentColor` so it recolours for free.
 */
export default function Crest({ className = "", strokeWidth = 1.1 }: Props) {
  return (
    <svg viewBox="0 0 220 240" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
        {/* finial + rays */}
        <circle cx="110" cy="10" r="3.4" />
        <path d="M110 18v12" />
        <g opacity=".75">
          <path d="M86 30l-6-9M134 30l6-9M70 44l-10-6M150 44l10-6" />
        </g>

        {/* arch / gateway */}
        <path d="M74 74c0-20 16-36 36-36s36 16 36 36" />
        <path d="M74 74h72" />

        {/* shield */}
        <path d="M110 66c-16 6-27 8-38 8v50c0 28 17 47 38 58 21-11 38-30 38-58V74c-11 0-22-2-38-8Z" />
        <path d="M110 76c-13 5-21 7-30 7v41c0 23 14 39 30 48 16-9 30-25 30-48V83c-9 0-17-2-30-7Z" opacity=".5" />

        {/* open book */}
        <path d="M110 116c-6-5-14-7-22-6v26c8-1 16 1 22 6 6-5 14-7 22-6v-26c-8-1-16 1-22 6Z" />
        <path d="M110 116v26" />

        {/* rising sun under the book */}
        <path d="M92 152a18 18 0 0 1 36 0" />
        <path d="M86 152h48" />

        {/* laurels */}
        <path d="M66 96c-14 8-20 24-16 40 8-10 15-16 22-18" />
        <path d="M154 96c14 8 20 24 16 40-8-10-15-16-22-18" />
        <path d="M62 140c-8 12-8 26 0 38 3-10 8-17 14-21" />
        <path d="M158 140c8 12 8 26 0 38-3-10-8-17-14-21" />

        {/* ribbon */}
        <path d="M62 206c16 8 32 12 48 12s32-4 48-12" />
        <path d="M62 206l-8 10 14 2M158 206l8 10-14 2" />
      </g>
    </svg>
  );
}
