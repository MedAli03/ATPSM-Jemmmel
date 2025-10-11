// src/components/events/Calendar.jsx
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

const TZ = "Africa/Tunis";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(TZ);

const STATUT_COLORS = {
  brouillon: "bg-gray-200 text-gray-700 border border-gray-200",
  publie: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  annule: "bg-rose-100 text-rose-700 border border-rose-200 line-through",
};

const VIEW_OPTIONS = [
  { value: "month", label: "شهر" },
  { value: "week", label: "أسبوع" },
  { value: "day", label: "يوم" },
];

function toDay(value) {
  return dayjs.tz(value, TZ);
}

function computeRange(view, anchor) {
  if (view === "day") {
    const start = anchor.startOf("day");
    const end = anchor.endOf("day");
    return { start, end };
  }
  if (view === "week") {
    const start = anchor.startOf("week");
    const end = anchor.endOf("week");
    return { start, end };
  }
  const start = anchor.startOf("month").startOf("week");
  const end = anchor.endOf("month").endOf("week");
  return { start, end };
}

function formatRange(range) {
  return {
    start: range.start.toISOString(),
    end: range.end.toISOString(),
  };
}

export default function EventsCalendar({
  events = [],
  initialView = "month",
  onViewChange,
  onRangeChange,
  onCreate,
  onEventClick,
  loading = false,
}) {
  const [view, setView] = useState(initialView);
  const [anchor, setAnchor] = useState(dayjs().tz(TZ));

  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const range = useMemo(() => computeRange(view, anchor), [view, anchor]);

  useEffect(() => {
    onRangeChange?.(formatRange(range));
  }, [range, onRangeChange]);

  const handlePrev = () => {
    setAnchor((prev) =>
      view === "day"
        ? prev.subtract(1, "day")
        : view === "week"
        ? prev.subtract(1, "week")
        : prev.subtract(1, "month")
    );
  };

  const handleNext = () => {
    setAnchor((prev) =>
      view === "day"
        ? prev.add(1, "day")
        : view === "week"
        ? prev.add(1, "week")
        : prev.add(1, "month")
    );
  };

  const handleToday = () => {
    setAnchor(dayjs().tz(TZ));
  };

  const groupedEvents = useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      const start = toDay(event.start);
      const key = start.format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    });
    map.forEach((arr) => {
      arr.sort((a, b) => toDay(a.start).valueOf() - toDay(b.start).valueOf());
    });
    return map;
  }, [events]);

  const renderDayCell = (day) => {
    const key = day.format("YYYY-MM-DD");
    const items = groupedEvents.get(key) ?? [];
    const isToday = day.isSame(dayjs().tz(TZ), "day");
    const isCurrentMonth = day.month() === anchor.month();

    return (
      <div
        key={key}
        className={`flex min-h-[140px] flex-col border border-gray-200 bg-white p-2 transition hover:bg-indigo-50 ${
          isCurrentMonth ? "" : "bg-gray-50 text-gray-400"
        }`}
      >
        <button
          type="button"
          className={`flex w-full items-center justify-between text-xs font-semibold ${
            isToday ? "text-indigo-600" : "text-gray-600"
          }`}
          onClick={() => onCreate?.(day.startOf("day"))}
        >
          <span>{day.locale("ar").format("D MMMM")}</span>
          <span className="rounded-full bg-gray-100 px-2 text-[10px] text-gray-500">
            {items.length}
          </span>
        </button>
        <div className="mt-2 flex flex-col gap-1">
          {items.map((item) => {
            const starts = toDay(item.start);
            const ends = item.end ? toDay(item.end) : starts;
            const isPast = ends.isBefore(dayjs().tz(TZ));
            const colorClass = STATUT_COLORS[item.statut] || "bg-slate-100 text-slate-700";
            return (
              <button
                key={item.id}
                type="button"
                className={`truncate rounded-md px-2 py-1 text-right text-xs ${colorClass} ${
                  isPast ? "opacity-60" : ""
                }`}
                onClick={() => onEventClick?.(item)}
              >
                <div className="font-semibold">{item.title || item.titre}</div>
                <div className="text-[10px] text-gray-600">
                  {`${starts.format("HH:mm")} - ${ends.format("HH:mm")}`}
                </div>
              </button>
            );
          })}
          {items.length === 0 ? (
            <p className="mt-4 text-center text-[11px] text-gray-400">لا توجد فعاليات</p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const { start } = range;
    const days = Array.from({ length: 7 }, (_, idx) => start.add(idx, "day"));
    return (
      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <div key={day.format()} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>{day.locale("ar").format("dddd")}</span>
              <button
                type="button"
                className="rounded-full bg-gray-100 px-2 text-[11px] text-gray-500"
                onClick={() => onCreate?.(day.startOf("day"))}
              >
                +
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {(groupedEvents.get(day.format("YYYY-MM-DD")) ?? []).map((item) => {
                const colorClass = STATUT_COLORS[item.statut] || "bg-slate-100 text-slate-700";
                const starts = toDay(item.start);
                const ends = item.end ? toDay(item.end) : starts;
                const isPast = ends.isBefore(dayjs().tz(TZ));
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`w-full rounded-lg px-3 py-2 text-right text-xs ${colorClass} ${
                      isPast ? "opacity-50" : ""
                    }`}
                    onClick={() => onEventClick?.(item)}
                  >
                    <div className="font-semibold">{item.title || item.titre}</div>
                    <div className="text-[11px] text-gray-600">
                      {starts.format("HH:mm")} – {ends.format("HH:mm")}
                    </div>
                  </button>
                );
              })}
              {(groupedEvents.get(day.format("YYYY-MM-DD")) ?? []).length === 0 ? (
                <p className="text-center text-[11px] text-gray-400">لا يوجد أحداث</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    const day = anchor.startOf("day");
    const items = groupedEvents.get(day.format("YYYY-MM-DD")) ?? [];
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{day.locale("ar").format("dddd، D MMMM YYYY")}</h3>
          <button
            type="button"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => onCreate?.(day)}
          >
            إضافة فعالية
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-sm text-gray-400">لا توجد فعاليات لهذا اليوم</p>
          ) : (
            items.map((item) => {
              const colorClass = STATUT_COLORS[item.statut] || "bg-slate-100 text-slate-700";
              const starts = toDay(item.start);
              const ends = item.end ? toDay(item.end) : starts;
              const isPast = ends.isBefore(dayjs().tz(TZ));
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full flex-col items-start gap-1 rounded-xl px-4 py-3 text-right text-sm ${colorClass} ${
                    isPast ? "opacity-60" : ""
                  }`}
                  onClick={() => onEventClick?.(item)}
                >
                  <span className="text-base font-semibold">{item.title || item.titre}</span>
                  <span className="text-xs text-gray-600">
                    {starts.format("HH:mm")} – {ends.format("HH:mm")}
                  </span>
                  {item.type ? (
                    <span className="rounded-full bg-indigo-100 px-2 text-[11px] text-indigo-700">
                      {item.type === "interne" ? "داخلي" : "عام"}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (view === "week") return renderWeekView();
    if (view === "day") return renderDayView();

    const days = [];
    const start = range.start;
    for (let i = 0; i < 42; i += 1) {
      days.push(start.add(i, "day"));
    }
    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => renderDayCell(day))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
            onClick={handlePrev}
            aria-label="الشهر السابق"
          >
            ‹
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
            onClick={handleToday}
          >
            اليوم
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
            onClick={handleNext}
            aria-label="الشهر التالي"
          >
            ›
          </button>
          <p className="text-lg font-semibold text-gray-800">
            {anchor.locale("ar").format(view === "month" ? "MMMM YYYY" : "MMMM YYYY")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setView(opt.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                view === opt.value
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid animate-pulse grid-cols-1 gap-2 rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
          جار تحميل الفعاليات...
        </div>
      ) : (
        renderBody()
      )}
    </div>
  );
}
