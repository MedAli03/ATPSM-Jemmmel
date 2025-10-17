import { Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useRealtimeThread } from "../../hooks/useRealtimeThread";

export default function MessagesLayout() {
  const location = useLocation();
  const threadId = useMemo(() => {
    const match = location.pathname.match(/messages\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [location.pathname]);
  const realtime = useRealtimeThread(threadId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900" dir="rtl">
      <Outlet context={realtime} />
    </div>
  );
}
