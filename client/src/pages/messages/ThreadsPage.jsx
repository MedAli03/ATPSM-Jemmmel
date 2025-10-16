import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ThreadListVirtualized from "../../modules/messaging/components/ThreadListVirtualized";
import SearchInputDebounced from "../../modules/messaging/components/SearchInputDebounced";
import ErrorState from "../../modules/messaging/components/ErrorState";
import NewThreadModal from "../../modules/messaging/components/NewThreadModal";
import { useMessagingContext } from "../../modules/messaging/context/MessagingProvider";
import { useAuth } from "../../context/AuthContext";

const filters = [
  { id: "all", label: "الكل" },
  { id: "unread", label: "غير مقروء" },
  { id: "read", label: "مقروء" },
  { id: "archived", label: "مؤرشفة" },
];

const densityOptions = [
  { id: "comfortable", label: "مريح" },
  { id: "compact", label: "مضغوط" },
];

const ThreadsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const { currentUser } = useAuth();
  const { state, actions, selectors } = useMessagingContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [density, setDensity] = useState("comfortable");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const currentUserId = currentUser?.id || "u-directeur";
  const threads = useMemo(() => selectors.threads(state), [selectors, state]);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    actions
      .listThreads({ search: debouncedSearch, filter, reset: true })
      .catch((err) => {
        if (!isCancelled) setError(err);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [actions, debouncedSearch, filter]);

  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key?.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeThreadId = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("messages");
    if (index === -1) return null;
    return segments[index + 1] || null;
  }, [location.pathname]);

  const basePath = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const index = segments.indexOf("messages");
    if (index === -1) return "/dashboard/messages";
    return `/${segments.slice(0, index + 1).join("/")}`;
  }, [location.pathname]);

  const filteredThreads = useMemo(() => {
    if (filter === "archived") {
      return threads.filter((thread) => thread.archived);
    }
    if (filter === "unread") {
      return threads.filter((thread) => (thread.unreadCount || 0) > 0);
    }
    if (filter === "read") {
      return threads.filter((thread) => (thread.unreadCount || 0) === 0 && !thread.archived);
    }
    return threads;
  }, [threads, filter]);

  const handleSelectThread = (thread) => {
    if (!thread) return;
    navigate(`${basePath}/${thread.id}`);
  };

  const toggleArchiveFilter = () => {
    setFilter((prev) => (prev === "archived" ? "all" : "archived"));
  };

  const total = filteredThreads.length;

  const participantDirectory = useMemo(() => {
    const map = new Map();
    threads.forEach((thread) => {
      (thread.participants || []).forEach((participant) => {
        if (!map.has(participant.id)) {
          map.set(participant.id, participant);
        }
      });
    });
    return Array.from(map.values());
  }, [threads]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10" dir="rtl">
      <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-b from-white/95 to-white/70 pb-4 pt-6 backdrop-blur dark:border-slate-700 dark:from-slate-900/90 dark:to-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الرسائل</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              مساحة واحدة لكل محادثاتك. استخدم البحث السريع (Ctrl+K) أو الأسهم للتنقل.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            + محادثة جديدة
          </button>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInputDebounced
              ref={searchRef}
              value={searchTerm}
              onImmediateChange={setSearchTerm}
              onChange={setDebouncedSearch}
              placeholder="ابحث عن محادثة أو مشارك"
              label="البحث"
            />
            <span className="text-xs text-slate-500">{isLoading ? "جاري التحديث…" : `${total} محادثة`}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  filter === item.id
                    ? "bg-primary-500 text-white"
                    : "bg-white text-slate-600 shadow-sm hover:bg-primary-50 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800">
              {densityOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDensity(option.id)}
                  className={`rounded-full px-3 py-1 ${
                    density === option.id ? "bg-primary-500 text-white" : "text-slate-600 hover:bg-primary-50 dark:text-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <ErrorState onRetry={() => actions.listThreads({ search: debouncedSearch, filter, reset: true })} />
      ) : (
        <ThreadListVirtualized
          threads={filteredThreads}
          isLoading={isLoading}
          activeThreadId={activeThreadId}
          onSelect={handleSelectThread}
          density={density}
          onToggleArchive={toggleArchiveFilter}
        />
      )}

      <NewThreadModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={async (payload) => {
          const thread = await actions.createThread({
            ...payload,
            participantIds: Array.from(new Set([currentUserId, ...(payload.participantIds || [])])),
            initialMessage: { ...payload.initialMessage, senderId: currentUserId },
          });
          setShowModal(false);
          navigate(`${basePath}/${thread.id}`);
        }}
        currentUserId={currentUserId}
        directory={participantDirectory}
      />
    </div>
  );
};

export default ThreadsPage;
