// src/components/dashboard/charts/PeiStatus.jsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const STATUS = [
  { key: "EN_ATTENTE_VALIDATION", label: "بانتظار المصادقة" },
  { key: "VALIDE", label: "مفعّل" },
  { key: "CLOTURE", label: "مغلَق" },
  { key: "REFUSE", label: "مرفوض" },
];

export default function PeiStatus({ data, emptyLabel }) {
  const src = STATUS.map(({ key, label }) => ({
    name: label,
    value: data?.[key] || 0,
  }));
  const total = src.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  if (!total) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-gray-500">
        {emptyLabel || "لا توجد بيانات"}
      </div>
    );
  }

  return (
    <div className="h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={src} dataKey="value" nameKey="name" outerRadius={90}>
            {src.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
