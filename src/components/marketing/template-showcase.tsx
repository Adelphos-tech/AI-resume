import { RESUME_TEMPLATES } from "@/lib/resume-schema";

/**
 * Public template showcase — richer display-only previews of the four
 * real production templates. Abstract resume-page mockups; no real or
 * fixture candidate data.
 */

function L({
  w,
  tone = "bg-stone-300",
  h = "h-[3px]",
}: {
  w: string;
  tone?: string;
  h?: string;
}) {
  return <div className={`${h} ${w} rounded-full ${tone}`} />;
}

function Sheet({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[1/1.32] w-full flex-col rounded-lg border border-stone-200 bg-white p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function AtsPreview() {
  return (
    <Sheet>
      <div className="flex flex-col items-center gap-1">
        <L w="w-1/2" tone="bg-stone-700" h="h-[4px]" />
        <L w="w-2/3" tone="bg-stone-400" h="h-[2px]" />
      </div>
      <div className="mt-2.5 border-t-[1.5px] border-stone-700" />
      <L w="w-1/4" tone="bg-stone-700" h="h-[3px]" />
      <div className="mt-1 space-y-1">
        <L w="w-full" />
        <L w="w-full" />
        <L w="w-4/5" />
      </div>
      <L w="w-1/4" tone="bg-stone-700" h="h-[3px]" />
      <div className="mt-1 space-y-1">
        <L w="w-full" />
        <L w="w-3/4" />
      </div>
      <L w="w-1/5" tone="bg-stone-700" h="h-[3px]" />
      <div className="mt-1 space-y-1">
        <L w="w-full" />
        <L w="w-2/3" />
      </div>
    </Sheet>
  );
}

function CorporatePreview() {
  return (
    <Sheet>
      <L w="w-3/5" tone="bg-stone-800" h="h-[5px]" />
      <L w="w-2/5" tone="bg-stone-500" h="h-[2.5px]" />
      <div className="mt-2 border-t-2 border-stone-800" />
      <div className="mt-2.5" />
      <L w="w-1/4" tone="bg-stone-800" h="h-[3px]" />
      <div className="mt-1.5 space-y-1">
        <L w="w-full" />
        <L w="w-4/5" />
        <L w="w-2/3" />
      </div>
      <div className="mt-2.5" />
      <L w="w-1/4" tone="bg-stone-800" h="h-[3px]" />
      <div className="mt-1.5 space-y-1">
        <L w="w-full" />
        <L w="w-3/4" />
      </div>
      <div className="mt-2.5" />
      <L w="w-1/4" tone="bg-stone-800" h="h-[3px]" />
      <div className="mt-1.5 space-y-1">
        <L w="w-5/6" />
      </div>
    </Sheet>
  );
}

function TechnicalPreview() {
  return (
    <Sheet>
      <L w="w-1/2" tone="bg-stone-700" h="h-[4px]" />
      <div className="mt-0.5 flex gap-1">
        <L w="w-1/6" tone="bg-stone-400" h="h-[2px]" />
        <L w="w-1/5" tone="bg-stone-400" h="h-[2px]" />
        <L w="w-1/4" tone="bg-stone-400" h="h-[2px]" />
      </div>
      <div className="mt-1.5 border-t border-stone-500" />
      <L w="w-1/5" tone="bg-stone-600" h="h-[2.5px]" />
      <div className="mt-0.5 space-y-0.5">
        <L w="w-full" h="h-[2px]" />
        <L w="w-full" h="h-[2px]" />
        <L w="w-5/6" h="h-[2px]" />
        <L w="w-4/5" h="h-[2px]" />
      </div>
      <L w="w-1/5" tone="bg-stone-600" h="h-[2.5px]" />
      <div className="mt-0.5 space-y-0.5">
        <L w="w-full" h="h-[2px]" />
        <L w="w-5/6" h="h-[2px]" />
        <L w="w-3/4" h="h-[2px]" />
      </div>
      <L w="w-1/5" tone="bg-stone-600" h="h-[2.5px]" />
      <div className="mt-0.5 space-y-0.5">
        <L w="w-2/3" h="h-[2px]" />
        <L w="w-1/2" h="h-[2px]" />
      </div>
    </Sheet>
  );
}

function ModernPreview() {
  return (
    <Sheet>
      <L w="w-3/5" tone="bg-stone-600" h="h-[4px]" />
      <L w="w-2/5" tone="bg-stone-300" h="h-[2px]" />
      <div className="mt-3 border-t border-stone-200" />
      <div className="mt-3" />
      <L w="w-1/5" tone="bg-stone-300" h="h-[2px]" />
      <div className="mt-1.5 space-y-1.5">
        <L w="w-full" />
        <L w="w-4/5" />
      </div>
      <div className="mt-3" />
      <L w="w-1/5" tone="bg-stone-300" h="h-[2px]" />
      <div className="mt-1.5 space-y-1.5">
        <L w="w-full" />
        <L w="w-3/5" />
      </div>
    </Sheet>
  );
}

const PREVIEWS: Record<string, () => React.ReactNode> = {
  "ats-classic": AtsPreview,
  "corporate-professional": CorporatePreview,
  technical: TechnicalPreview,
  "modern-minimal": ModernPreview,
};

export function TemplateShowcase() {
  return (
    <section id="templates" className="bg-emerald-50/40 py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Professional templates.{" "}
            <span className="text-emerald-700">
              Built for real applications.
            </span>
          </h2>
          <p className="text-stone-600">
            Your career content stays structured and unchanged — only the
            presentation changes. Choose the design that fits your field.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(RESUME_TEMPLATES).map((t) => {
            const Preview = PREVIEWS[t.key];
            return (
              <div
                key={t.key}
                className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-lg hover:shadow-emerald-900/10"
              >
                <div aria-hidden className="overflow-hidden">
                  {Preview && <Preview />}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {t.name}
                  </p>
                  <p className="text-xs font-medium text-emerald-700">
                    {t.category}
                  </p>
                  <p className="text-xs leading-relaxed text-stone-500">
                    {t.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
