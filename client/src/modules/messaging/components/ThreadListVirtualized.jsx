import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import ThreadItem from "./ThreadItem";
import SkeletonRow from "./SkeletonRow";
import EmptyState from "./EmptyState";

const densitySizes = {
  comfortable: 112,
  compact: 86,
};

const ThreadListVirtualized = ({
  threads = [],
  isLoading = false,
  activeThreadId,
  onSelect,
  density = "comfortable",
  onToggleArchive,
}) => {
  const parentRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const size = densitySizes[density] || densitySizes.comfortable;
  const items = useMemo(() => threads, [threads]);

  const rowVirtualizer = useVirtualizer({
    count: isLoading && !items.length ? 6 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => size,
    overscan: 4,
  });

  useEffect(() => {
    const activeIndex = items.findIndex((item) => String(item?.id) === String(activeThreadId));
    if (activeIndex >= 0) {
      setFocusedIndex(activeIndex);
    }
  }, [activeThreadId, items]);

  useEffect(() => {
    const virtualItem = rowVirtualizer.getVirtualItems().find((item) => item.index === focusedIndex);
    if (virtualItem) {
      rowVirtualizer.scrollToIndex(focusedIndex, { align: "auto" });
    }
  }, [focusedIndex, rowVirtualizer]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, Math.max(items.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter" && items[focusedIndex]) {
      onSelect?.(items[focusedIndex]);
    }
    if (event.key?.toLowerCase() === "a") {
      onToggleArchive?.();
    }
  };

  if (!isLoading && items.length === 0) {
    return <EmptyState title="لا توجد محادثات" description="ابدأ محادثة جديدة لمشاهدة الرسائل هنا." />;
  }

  return (
    <div
      ref={parentRef}
      className="min-h-[340px] h-[60vh] lg:h-[calc(100vh-18rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/70 p-2 shadow-inner focus:outline-none dark:border-slate-800 dark:bg-slate-900/70"
      role="listbox"
      aria-activedescendant={items[focusedIndex] ? `thread-${items[focusedIndex].id}` : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const thread = items[virtualRow.index];
          const top = virtualRow.start;
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top,
                width: "100%",
              }}
            >
              {isLoading && !thread ? (
                <SkeletonRow density={density} />
              ) : (
                <ThreadItem
                  thread={thread}
                  isActive={String(thread?.id) === String(activeThreadId)}
                  onSelect={() => onSelect?.(thread)}
                  density={density}
                  index={virtualRow.index}
                  total={items.length}
                  onKeyNavigate={setFocusedIndex}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreadListVirtualized;
