import type { ReactNode } from "react";

/**
 * Compact professional action control. `primary` for the one dominant CTA
 * (e.g. View Resume), `ghost` for professional links.
 */
export function ActionPill({
  href,
  icon,
  label,
  variant = "ghost",
  className = "",
  iconClassName = "size-4",
}: {
  href: string;
  icon: ReactNode;
  label: string;
  variant?: "primary" | "ghost";
  className?: string;
  iconClassName?: string;
}) {
  return (
    <a
      href={href}
      data-variant={variant}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold transition ${className}`}
    >
      <span aria-hidden className={iconClassName}>
        {icon}
      </span>
      {label}
    </a>
  );
}
