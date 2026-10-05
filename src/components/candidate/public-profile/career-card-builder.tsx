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

export type BuilderStep = "basics" | "design" | "company" | "preview";

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
  {
    id: "preview",
    label: "Preview",
    description: "Review your card",
    icon: Eye,
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
              onClick={() => onChange(step.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 sm:px-4 ${
                isActive
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sr-only">{step.description}</span>
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
      <div className="flex items-center justify-between">
        <div>
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

      <div
        className={`mx-auto w-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 ${
          previewMode === "mobile" ? "max-w-[390px]" : "max-w-full"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function CareerCardBuilder({
  initialStep = "basics",
  header,
  stepContent,
  preview,
}: {
  initialStep?: BuilderStep;
  header?: React.ReactNode;
  stepContent: Record<BuilderStep, React.ReactNode>;
  preview: React.ReactNode;
}) {
  const [activeStep, setActiveStep] = useState<BuilderStep>(initialStep);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );

  return (
    <div className="flex flex-col gap-6">
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

      {/* Step navigation */}
      <CareerCardBuilderSteps active={activeStep} onChange={setActiveStep} />

      {/* Main workspace */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Editor column */}
        <div className="min-w-0 flex-1 lg:max-w-[65%]">
          <div className="space-y-5">{stepContent[activeStep]}</div>
        </div>

        {/* Preview column — shown on mobile only when Preview step is active */}
        <div
          className={`lg:block lg:w-[35%] lg:max-w-md ${
            activeStep === "preview" ? "block" : "hidden"
          }`}
        >
          <div className="lg:sticky lg:top-6">
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
