"use client";

import { useState } from "react";
import {
  Brush,
  Building2,
  Eye,
  Monitor,
  Smartphone,
  UserCircle,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PreviewModeProvider } from "./preview-mode-context";
import { CareerCardSaveBar, type SaveBarStatus } from "./career-card-save-bar";

export type BuilderStep = "basics" | "design" | "company";

export const STEPS: {
  id: BuilderStep;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: "basics",
    label: "Basics",
    description: "Identity & content",
    icon: UserCircle,
  },
  { id: "design", label: "Design", description: "Theme & style", icon: Brush },
  {
    id: "company",
    label: "Company",
    description: "Optional details",
    icon: Building2,
  },
];

export function CareerCardBuilderSteps({
  active,
  onChange,
}: {
  active: BuilderStep;
  onChange: (step: BuilderStep) => void;
}) {
  return (
    <nav aria-label="Career Card builder steps" className="w-full">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
        {STEPS.map((step) => {
          const isActive = active === step.id;
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={step.label}
              onClick={() => onChange(step.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 sm:px-4 ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline" aria-hidden="true">
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function CareerCardPreviewPanel({
  previewMode,
  onPreviewModeChange,
  children,
}: {
  previewMode: "desktop" | "mobile";
  onPreviewModeChange: (mode: "desktop" | "mobile") => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-stone-900">Live preview</h3>
          <p className="text-xs text-stone-500">
            See how your Career Card looks to others.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Preview device"
          className="flex items-center rounded-lg border border-stone-200 bg-white p-0.5"
        >
          {(
            [
              ["desktop", "Desktop", Monitor],
              ["mobile", "Mobile", Smartphone],
            ] as const
          ).map(([mode, label, Icon]) => {
            const selected = previewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onPreviewModeChange(mode)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 ${
                  selected
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {previewMode === "mobile" ? (
        /* phone device mockup */
        <div className="mx-auto flex justify-center py-4">
          <div className="relative w-full max-w-[410px] rounded-[3rem] border-[6px] border-stone-800 bg-stone-900 p-2 shadow-2xl">
            {/* speaker bar */}
            <div className="absolute top-3 left-1/2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-stone-700" />
            {/* screen */}
            <div className="overflow-hidden rounded-[2.4rem] bg-white">
              <PreviewModeProvider mode={previewMode}>
                {children}
              </PreviewModeProvider>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300">
          <PreviewModeProvider mode={previewMode}>
            {children}
          </PreviewModeProvider>
        </div>
      )}
    </div>
  );
}

export function CareerCardBuilder({
  initialStep = "basics",
  header,
  stepContent,
  preview,
  saveState,
}: {
  initialStep?: BuilderStep;
  header?: React.ReactNode;
  stepContent: Record<BuilderStep, React.ReactNode>;
  preview: React.ReactNode;
  saveState?: {
    status: SaveBarStatus;
    message?: string | null;
    onSave: () => void;
  };
}) {
  const [activeStep, setActiveStep] = useState<BuilderStep>(initialStep);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-6 ${saveState ? "pb-24 lg:pb-0" : ""}`}>
      {/* Page header */}
      {header ?? (
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">
            Career Card Builder
          </h1>
          <p className="text-[15px] leading-relaxed text-stone-600">
            Create and customize the professional profile you share with others.
          </p>
        </div>
      )}

      {/* Step navigation + mobile preview trigger */}
      <div className="flex items-center gap-3">
        <CareerCardBuilderSteps active={activeStep} onChange={setActiveStep} />
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-xs font-semibold text-stone-600 shadow-sm transition-colors hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-emerald-600 lg:hidden"
            >
              <Eye className="size-4" aria-hidden />
              Preview
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85dvh] rounded-t-2xl">
            <SheetTitle className="sr-only">Career Card Preview</SheetTitle>
            <CareerCardPreviewPanel
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            >
              {preview}
            </CareerCardPreviewPanel>
          </SheetContent>
        </Sheet>
      </div>

      {/* Global save action area — one Save Changes control for the whole
          builder. Sticky top bar on lg+, fixed bottom bar below lg. */}
      {saveState && (
        <CareerCardSaveBar
          status={saveState.status}
          message={saveState.message}
          onSave={saveState.onSave}
          onPreview={() => setPreviewOpen(true)}
        />
      )}

      {/* Main workspace */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Editor column */}
        <div className="w-full min-w-0 max-w-3xl flex-1 xl:max-w-none">
          <div className="space-y-5">{stepContent[activeStep]}</div>
        </div>

        {/* Preview column — always visible on desktop */}
        <div className="hidden xl:block xl:w-[46%] xl:max-w-[560px] xl:shrink-0">
          <div className="xl:sticky xl:top-6">
            <CareerCardPreviewPanel
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            >
              {preview}
            </CareerCardPreviewPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
