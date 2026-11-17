import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "light" | "outlineLight";

const base =
  "inline-flex min-h-14 items-center justify-center rounded-full px-8 py-3 text-lg font-semibold no-underline transition-colors text-center";

const variants: Record<Variant, string> = {
  primary: "bg-plum text-white hover:bg-plum-dark",
  secondary:
    "border-2 border-plum bg-transparent text-plum hover:bg-plum-50",
  light: "bg-cream text-night hover:bg-white",
  // For dark backgrounds (header, hero, footer)
  outlineLight: "border-2 border-cream bg-transparent text-cream hover:bg-white/10",
};

export function buttonClasses(variant: Variant = "primary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

type Props = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "primary", className = "", ...props }: Props) {
  return <Link {...props} className={buttonClasses(variant, className)} />;
}
