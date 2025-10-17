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
    <div
      className="flex h-full min-h-0 flex-col bg-slate-50 dark:bg-slate-900"
      dir="rtl"
    >
      <Outlet context={realtime} />
    </div>
  );
}
