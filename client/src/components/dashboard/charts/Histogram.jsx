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

export default function Histogram({ data }) {
  // data: { bins, histogram: [{ from, to, count }] }
  const src = (data?.histogram || []).map((b) => ({
    range: `${b.from}–${b.to}`,
    count: b.count,
  }));

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">توزيع الدرجات</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={src}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
