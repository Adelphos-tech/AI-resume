"use client";

/**
 * Reusable card container for Career Card Builder sections.
 * White card, subtle border, generous padding, rounded corners.
 */
export function CareerCardBuilderSection({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-stone-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
