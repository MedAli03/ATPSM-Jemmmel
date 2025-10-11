// src/components/dashboard/StatCard.jsx
export default function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-2xl font-bold mt-1">{value ?? 0}</div>
      {hint ? <div className="text-xs text-gray-400 mt-1">{hint}</div> : null}
    </div>
  );
}
