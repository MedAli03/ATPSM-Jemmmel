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

export default function WeeklyBar({ data, emptyLabel }) {
  // data: [{ isoWeek: 202445, count: 3 }, ...]
  const points = data || [];
  const isEmpty = !points.length;

  return (
    <div className="h-full min-h-[220px]">
      {isEmpty ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          {emptyLabel || "لا توجد بيانات"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="isoWeek" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="currentColor" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
