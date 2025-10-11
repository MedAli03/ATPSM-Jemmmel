// src/components/dashboard/charts/WeeklyBar.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function WeeklyBar({ data }) {
  // data: [{ isoWeek: 202445, count: 3 }, ...]
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">النشاطات خلال الأسابيع الأخيرة</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="isoWeek" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="currentColor" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
