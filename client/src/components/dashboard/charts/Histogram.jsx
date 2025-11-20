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

export default function Histogram({ data, emptyLabel }) {
  // data: { bins, histogram: [{ from, to, count }] }
  const src = (data?.histogram || []).map((b) => ({
    range: `${b.from}–${b.to}`,
    count: b.count,
  }));
  const isEmpty = !src.some((b) => Number(b.count) > 0);

  return (
    <div className="h-full min-h-[220px]">
      {isEmpty ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          {emptyLabel || "لا توجد بيانات"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={src}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
