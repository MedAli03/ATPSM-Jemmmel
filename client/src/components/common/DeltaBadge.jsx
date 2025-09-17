export default function DeltaBadge({
  value,
  suffix = "%",
  positiveIsGood = true,
}) {
  if (value === null || value === undefined) return null;

  const isPositive = Number(value) >= 0;
  const good = positiveIsGood ? isPositive : !isPositive;

  const color = good ? "text-green-600" : "text-red-600";
  const bg = good ? "bg-green-50" : "bg-red-50";
  const sign = isPositive ? "+" : "";

  return (
    <span
      className={`${bg} ${color} text-xs font-semibold px-2 py-1 rounded-full`}
    >
      {sign}
      {value}
      {suffix}
    </span>
  );
}
