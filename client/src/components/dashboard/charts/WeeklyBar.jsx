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

export default function WeeklyBar({ data = [], loading = false }) {
  // data: [{ isoWeek: 202445, count: 3 }, ...]
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="font-semibold mb-2">النشاطات خلال الأسابيع الأخيرة</div>
      {loading ? (
        <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
      ) : hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="isoWeek" />
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
