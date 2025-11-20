// src/components/dashboard/charts/Histogram.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Histogram({ data, loading = false }) {
  // data: { bins, histogram: [{ from, to, count }] }
  const src = (data?.histogram || []).map((b) => ({
    range: `${b.from}–${b.to}`,
    count: b.count,
  }));
  const hasData = src.length > 0;

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">توزيع الدرجات</div>
      {loading ? (
        <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
      ) : hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={src}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-sm text-gray-500">لا توجد بيانات متاحة حاليًا</div>
      )}
    </div>
  );
}
