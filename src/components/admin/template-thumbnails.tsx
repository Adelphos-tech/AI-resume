import type { ResumeTemplateKey } from "@/lib/resume-schema";

/**
 * Abstract layout thumbnails for the template selector.
 * Neutral blocks/lines only — no candidate or fixture content.
 * Orientation only: header weight, rule style, spacing/density.
 */

function Line({
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

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex h-28 w-full flex-col gap-1.5 rounded-md border border-stone-200 bg-white p-3"
    >
      {children}
    </div>
  );
}

function AtsClassicThumbnail() {
  return (
    <Frame>
      <Line w="w-2/5" tone="bg-stone-500" />
      <div className="flex gap-1.5">
        <Line w="w-1/4" tone="bg-stone-300" />
        <Line w="w-1/4" tone="bg-stone-300" />
        <Line w="w-1/5" tone="bg-stone-300" />
      </div>
      <div className="mt-1 border-t border-stone-500" />
      <Line w="w-1/5" tone="bg-stone-500" />
      <Line w="w-full" />
      <Line w="w-4/5" />
      <Line w="w-1/5" tone="bg-stone-500" />
      <Line w="w-full" />
      <Line w="w-3/5" />
    </Frame>
  );
}

function CorporateThumbnail() {
  return (
    <Frame>
      <Line w="w-1/2" tone="bg-stone-600" h="h-[4px]" />
      <Line w="w-1/3" tone="bg-stone-400" />
      <div className="mt-1 border-t-2 border-stone-600" />
      <Line w="w-1/4" tone="bg-stone-600" />
      <Line w="w-full" />
      <Line w="w-3/4" />
      <div className="mt-1.5" />
      <Line w="w-1/4" tone="bg-stone-600" />
      <Line w="w-full" />
      <Line w="w-2/3" />
    </Frame>
  );
}

function TechnicalThumbnail() {
  return (
    <Frame>
      <Line w="w-1/2" tone="bg-stone-600" h="h-[4px]" />
      <div className="flex gap-1">
        <Line w="w-1/6" tone="bg-stone-400" h="h-[2px]" />
        <Line w="w-1/6" tone="bg-stone-400" h="h-[2px]" />
        <Line w="w-1/4" tone="bg-stone-400" h="h-[2px]" />
      </div>
      <div className="mt-0.5 border-t border-stone-400" />
      <Line w="w-1/6" tone="bg-stone-500" h="h-[2.5px]" />
      <Line w="w-full" h="h-[2.5px]" />
      <Line w="w-5/6" h="h-[2.5px]" />
      <Line w="w-1/6" tone="bg-stone-500" h="h-[2.5px]" />
      <Line w="w-full" h="h-[2.5px]" />
      <Line w="w-4/5" h="h-[2.5px]" />
      <Line w="w-2/3" h="h-[2.5px]" />
    </Frame>
  );
}

function ModernMinimalThumbnail() {
  return (
    <Frame>
      <Line w="w-3/5" tone="bg-stone-500" h="h-[4px]" />
      <Line w="w-1/3" tone="bg-stone-300" h="h-[2.5px]" />
      <div className="mt-1.5 border-t border-stone-200" />
      <div className="mt-1.5" />
      <Line w="w-1/5" tone="bg-stone-300" h="h-[2.5px]" />
      <div className="mt-0.5" />
      <Line w="w-full" />
      <Line w="w-4/5" />
      <div className="mt-1.5" />
      <Line w="w-1/5" tone="bg-stone-300" h="h-[2.5px]" />
      <Line w="w-3/5" />
    </Frame>
  );
}

function CompactProfessionalThumbnail() {
  return (
    <Frame>
      <Line w="w-1/2" tone="bg-stone-500" h="h-[4px]" />
      <Line w="w-3/4" h="h-[2.5px]" />
      <div className="mt-0.5 border-t border-stone-400" />
      <Line w="w-1/6" tone="bg-stone-500" h="h-[2.5px]" />
      <Line w="w-full" h="h-[2.5px]" />
      <Line w="w-11/12" h="h-[2.5px]" />
      <Line w="w-1/6" tone="bg-stone-500" h="h-[2.5px]" />
      <Line w="w-full" h="h-[2.5px]" />
      <Line w="w-10/12" h="h-[2.5px]" />
      <Line w="w-1/6" tone="bg-stone-500" h="h-[2.5px]" />
      <Line w="w-full" h="h-[2.5px]" />
      <Line w="w-4/5" h="h-[2.5px]" />
    </Frame>
  );
}

function ExecutiveThumbnail() {
  return (
    <Frame>
      <div className="h-[3px] w-full rounded-full bg-emerald-600" />
      <Line w="w-2/5" tone="bg-stone-500" h="h-[4px]" />
      <Line w="w-1/3" tone="bg-emerald-600" h="h-[2.5px]" />
      <div className="mt-1 border-t border-stone-200" />
      <Line w="w-1/4" tone="bg-emerald-700" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-full" />
      <Line w="w-4/5" />
      <Line w="w-1/4" tone="bg-emerald-700" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-3/5" />
    </Frame>
  );
}

function ElegantSerifThumbnail() {
  return (
    <Frame>
      <div className="mx-auto w-1/3">
        <Line w="w-full" tone="bg-stone-500" h="h-[4px]" />
      </div>
      <div className="mx-auto w-1/2">
        <Line w="w-full" h="h-[2.5px]" />
      </div>
      <div className="mx-auto mt-1.5 w-3/5 border-t border-stone-200" />
      <div className="mt-2" />
      <Line w="w-1/5" tone="bg-stone-400" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-full" />
      <Line w="w-4/5" />
      <div className="mt-1.5" />
      <Line w="w-1/5" tone="bg-stone-400" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-3/5" />
    </Frame>
  );
}

function EmeraldBannerThumbnail() {
  return (
    <Frame>
      <div className="rounded-sm bg-emerald-700 px-1.5 py-1.5">
        <Line w="w-1/2" tone="bg-white/80" h="h-[3px]" />
        <Line w="w-3/4" tone="bg-white/40" h="h-[2px]" />
      </div>
      <Line w="w-1/4" tone="bg-emerald-700" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-full" />
      <Line w="w-4/5" />
      <Line w="w-1/4" tone="bg-emerald-700" h="h-[2.5px]" />
      <div className="mt-1" />
      <Line w="w-3/5" />
    </Frame>
  );
}

export const TEMPLATE_THUMBNAILS: Record<
  ResumeTemplateKey,
  () => React.ReactNode
> = {
  "ats-classic": AtsClassicThumbnail,
  "corporate-professional": CorporateThumbnail,
  technical: TechnicalThumbnail,
  "modern-minimal": ModernMinimalThumbnail,
  "compact-professional": CompactProfessionalThumbnail,
  executive: ExecutiveThumbnail,
  "elegant-serif": ElegantSerifThumbnail,
  "emerald-banner": EmeraldBannerThumbnail,
};
