import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ThreadItem from "../../components/messages/ThreadItem";
import EmptyState from "../../components/messages/EmptyState";
import { listThreads } from "../../api/messages";

const ThreadsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, page, setSearchParams]);

  const threadsQuery = useQuery({
    queryKey: ["threads", { page, search: debouncedSearch }],
    queryFn: () => listThreads({ page, search: debouncedSearch }),
    keepPreviousData: true,
  });

  const { threads, pagination } = useMemo(() => {
    const data = threadsQuery.data || {};
    return {
      threads: Array.isArray(data.threads) ? data.threads : [],
      pagination: data.pagination || {},
    };
  }, [threadsQuery.data]);

  const activeThreadId = location.pathname.includes("/messages/")
    ? location.pathname.split("/").pop()
    : null;

  const handleThreadClick = (threadId) => {
    const basePath = location.pathname.includes("/dashboard/manager")
      ? "/dashboard/manager/messages"
      : location.pathname.includes("/dashboard/president")
        ? "/dashboard/president/messages"
        : "/dashboard/messages";
    navigate(`${basePath}/${threadId}`);
  };

  const totalPages = Number(pagination?.totalPages || pagination?.pageCount || 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50/30" dir="rtl">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-2 text-right">
          <h1 className="text-2xl font-bold text-slate-900">الرسائل</h1>
          <p className="text-sm text-slate-600">
            تابع كل محادثاتك مع الأولياء والمربين من مكان واحد.
          </p>
        </header>

        <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث عن محادثة أو مشارك"
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-right shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <span className="text-xs text-slate-500">
              {threadsQuery.isFetching
                ? "جاري التحميل..."
                : `${pagination?.total ?? threads.length} محادثة`}
            </span>
          </div>

          {threadsQuery.isError && (
            <EmptyState
              icon="⚠️"
              title="تعذّر تحميل الرسائل"
              description="الرجاء التحقق من الاتصال بالمصدر ثم المحاولة مجدداً."
            />
          )}

          {threadsQuery.isSuccess && threads.length === 0 && !threadsQuery.isFetching ? (
            <EmptyState
              title="لا توجد محادثات"
              description="ابدأ محادثة جديدة من لوحة الإدارة لتظهر هنا."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {threads.map((thread) => (
                <ThreadItem
                  key={thread.id}
                  thread={thread}
                  isActive={String(thread.id) === activeThreadId}
                  onClick={() => handleThreadClick(thread.id)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-slate-600">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || threadsQuery.isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                السابق
              </button>
              <span>
                الصفحة {page} من {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages || threadsQuery.isFetching}
                className="rounded-full border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadsPage;
