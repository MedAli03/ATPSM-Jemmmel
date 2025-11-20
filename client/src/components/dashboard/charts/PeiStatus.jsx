// src/components/dashboard/charts/PeiStatus.jsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0ea5e9", "#22c55e", "#6366f1", "#f97316"];

export default function PeiStatus({ data = [], loading = false }) {
  const hasData = Array.isArray(data) && data.some((d) => d.value > 0);
  const palette = data.map((_, idx) => COLORS[idx % COLORS.length]);

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">حالة مشاريع PEI</div>
      {loading ? (
        <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
      ) : hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-gray-500">لا توجد بيانات متاحة حاليًا</div>
      )}
    </div>
  );
}
