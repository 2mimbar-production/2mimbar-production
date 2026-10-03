import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-800 disabled:bg-brand-300",
  secondary: "border border-line-strong bg-white text-ink hover:border-ink-3 disabled:opacity-50",
  ghost: "text-ink-2 hover:bg-ink/5 hover:text-ink disabled:opacity-50",
  danger: "text-signal hover:bg-signal/5 disabled:opacity-50",
};

/** Kelas tombol, dipakai juga untuk <Link> yang tampil sebagai tombol. */
export function kelasTombol(variant: Variant = "primary", className = "") {
  return `inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded px-3.5 text-sm font-medium transition-colors ${VARIANT[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={kelasTombol(variant, className)} {...rest}>
      {children}
    </button>
  );
}
