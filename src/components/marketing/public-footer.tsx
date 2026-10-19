import { LinkMeuLogo } from "@/components/marketing/link-meu-logo";

const PRODUCT_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#templates", label: "Templates" },
  { href: "#ai-review", label: "AI Review" },
  { href: "#pricing", label: "Pricing" },
];

const COMPANY_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Contact" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-emerald-950/8 bg-stone-50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <LinkMeuLogo className="h-8" />
          <p className="max-w-xs text-sm text-stone-500">
            Better resumes. Bigger opportunities.
          </p>
        </div>

        <nav aria-label="Product">
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Product
          </p>
          <ul className="mt-4 space-y-2.5">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-stone-600 transition-colors hover:text-stone-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase">
            Company
          </p>
          <ul className="mt-4 space-y-2.5">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm text-stone-600 transition-colors hover:text-stone-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-emerald-950/8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} LinkMeU. All rights reserved.
          </p>
          <p className="text-xs text-stone-400">LinkMeU internal access</p>
        </div>
      </div>
    </footer>
  );
}
