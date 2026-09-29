/** Single deterministic career fact: numeric value + uppercase label. */
export function StatItem({
  value,
  label,
  valueClassName = "text-xl font-bold",
  labelClassName = "text-[10px] font-medium uppercase tracking-wider text-stone-400",
  className = "",
}: {
  value: number | string;
  label: string;
  valueClassName?: string;
  labelClassName?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className={valueClassName}>{value}</div>
      <div className={labelClassName}>{label}</div>
    </div>
  );
}
