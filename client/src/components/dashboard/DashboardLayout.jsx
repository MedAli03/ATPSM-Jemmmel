// src/components/dashboard/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardTopbar from "./DashboardTopbar";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardTopbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
