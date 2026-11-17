import { LOGO_GLASS_PATH, LOGO_LETTERS_PATH, LOGO_VIEWBOX } from "./logo-paths";

/** The SY mark. Letters follow the text color; decorative (the name is always written next to it). */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden="true" focusable="false" className={className}>
      <path fill="var(--color-glass)" d={LOGO_GLASS_PATH} />
      <path fill="currentColor" fillRule="evenodd" d={LOGO_LETTERS_PATH} />
    </svg>
  );
}

/** Mark + "SILVER YOUNG / MODELS" in spaced capitals, as in the logo. */
export function LogoLockup({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark className={big ? "h-16 w-auto text-cream" : "h-11 w-auto text-cream sm:h-12"} />
      <span className="flex flex-col font-serif uppercase leading-none">
        <span className={`${big ? "text-2xl" : "text-lg sm:text-xl"} font-medium tracking-[0.22em] text-cream`}>
          Silver Young
        </span>
        <span className={`${big ? "mt-2 text-base" : "mt-1.5 text-sm"} tracking-[0.5em] text-mist`}>Models</span>
      </span>
    </span>
  );
}
