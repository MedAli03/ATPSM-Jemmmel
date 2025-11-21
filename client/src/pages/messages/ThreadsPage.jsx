import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { messagingApi } from "../../services/messagingApi";
import ThreadItem from "../../components/messages/ThreadItem";
import NewThreadModal from "../../components/messages/NewThreadModal";

const filters = [
  { id: "all", label: "الكل" },
  { id: "unread", label: "غير مقروء" },
  { id: "read", label: "مقروء" },
  { id: "archived", label: "مؤرشفة" },
];

const densities = [
  { id: "comfortable", label: "مريح" },
  { id: "compact", label: "مضغوط" },
];

export default function ThreadsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const realtime = useOutletContext();
  const queryClient = useQueryClient();
  const searchRef = useRef(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const statusParam = useMemo(() => {
    if (filter === "archived") return "archived";
    if (filter === "unread") return "unread";
    if (filter === "read") return "active";
    return undefined;
  }, [filter]);

  const threadsQuery = useQuery({
    queryKey: ["threads", { q: debouncedSearch, status: statusParam }],
    queryFn: () =>
      messagingApi.listThreads({
        q: debouncedSearch || undefined,
        status: statusParam,
      }),
    keepPreviousData: true,
    staleTime: 5000,
  });

  const threads = useMemo(() => {
    const list = threadsQuery.data?.data || [];
    if (filter === "read") {
      return list.filter((thread) => thread.unreadCount === 0 && !thread.archived);
    }
    return list;
  }, [threadsQuery.data, filter]);

  const activeThreadId = useMemo(() => {
    const match = location.pathname.match(/messages\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [location.pathname]);

  const parentRef = useRef(null);
  const rowVirtualizer = useVirtualizer({
    count: threads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (density === "compact" ? 88 : 112),
    overscan: 8,
  });

  const handleSelectThread = useCallback(
    (thread) => {
      if (!thread) return;
      setFocusedIndex(null);
      navigate(`${thread.id}`);
    },
    [navigate]
  );

  const handleThreadCreated = useCallback(
    (thread) => {
      if (!thread) return;
      setShowNewModal(false);
      setFilter("all");
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      navigate(`${thread.id}`);
    },
    [navigate, queryClient]
  );

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key.toLowerCase() === "a" && document.activeElement !== searchRef.current) {
        event.preventDefault();
        setFilter((prev) => (prev === "archived" ? "all" : "archived"));
      }
      if (event.key === "ArrowDown" && threads.length > 0) {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? 0 : Math.min(prev + 1, threads.length - 1);
          rowVirtualizer.scrollToIndex(next);
          return next;
        });
      }
      if (event.key === "ArrowUp" && threads.length > 0) {
        event.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev === null ? threads.length - 1 : Math.max(prev - 1, 0);
          rowVirtualizer.scrollToIndex(next);
          return next;
        });
      }
      if (event.key === "Enter" && focusedIndex !== null && threads.length > 0) {
        event.preventDefault();
        const thread = threads[focusedIndex];
        if (thread) handleSelectThread(thread);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [threads, focusedIndex, rowVirtualizer, handleSelectThread]);

  const isLoading = threadsQuery.isLoading;
  const isFetching = threadsQuery.isFetching;

  const total = threads.length;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 px-4 py-6" dir="rtl">
      <div className="flex flex-1 min-h-0 flex-col gap-6 rounded-3xl bg-white p-4 shadow-lg dark:bg-slate-900 lg:flex-row">
        <section className="flex h-full min-h-0 w-full flex-col lg:w-[360px]">
          <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-100 bg-white pb-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">الرسائل</h1>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {realtime?.connected ? "متصل بزمن حقيقي" : "وضع التحديث التلقائي كل ١٥ ثانية"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700"
                >
                  + محادثة جديدة
                </button>
              </div>
            <div className="flex flex-col gap-3">
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث عن محادثة أو مشارك"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-full px-3 py-1 transition ${
                      filter === item.id
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-primary-50 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {densities.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDensity(option.id)}
                    className={`rounded-full px-3 py-1 ${
                      density === option.id
                        ? "bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-primary-50 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                <span className="ml-auto text-slate-400">
                  {isFetching ? "جاري التحديث…" : `${total} محادثة`}
                </span>
              </div>
            </div>
          </header>
          <div
            ref={parentRef}
            className="mt-4 flex-1 overflow-y-auto pr-2"
            aria-label="قائمة المحادثات"
          >
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const thread = threads[virtualRow.index];
                return (
                  <div
                    key={thread?.id ?? virtualRow.index}
                    ref={virtualRow.measureRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <ThreadItem
                      thread={thread}
                      active={thread?.id === activeThreadId}
                      density={density}
                      onSelect={handleSelectThread}
                    />
                  </div>
                );
              })}
              {threads.length === 0 && !isLoading && (
                <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                  لا توجد نتائج مطابقة للبحث.
                </div>
              )}
              {isLoading && (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="hidden h-full min-h-0 flex-1 rounded-3xl bg-slate-50 p-2 dark:bg-slate-950 lg:flex">
          <div className="flex h-full flex-1 overflow-hidden rounded-3xl bg-white shadow-inner dark:bg-slate-900">
            <Outlet context={realtime} />
          </div>
        </section>
      </div>
      <section className="flex-1 lg:hidden">
        <Outlet context={realtime} />
      </section>
      <NewThreadModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleThreadCreated}
      />
    </div>
  );
}
