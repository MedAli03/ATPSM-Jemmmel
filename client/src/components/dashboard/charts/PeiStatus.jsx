// src/components/dashboard/charts/PeiStatus.jsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function PeiStatus({ data }) {
  // data: { brouillon, actif, clos }
  const src = [
    { name: "مسودة", value: data?.brouillon || 0 },
    { name: "نشِط", value: data?.actif || 0 },
    { name: "مغلق", value: data?.clos || 0 },
  ];
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">حالة مشاريع PEI</div>
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
