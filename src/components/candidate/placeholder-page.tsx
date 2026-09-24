export function CandidatePlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-stone-600">{description}</p>
      <p className="inline-flex rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        Coming in the next workspace stage
      </p>
    </div>
  );
}
