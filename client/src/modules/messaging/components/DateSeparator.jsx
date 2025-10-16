const DateSeparator = ({ date }) => (
  <div className="relative my-6 flex items-center justify-center">
    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
    <span className="mx-3 rounded-full bg-white px-4 py-1 text-xs font-medium text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
      {date}
    </span>
    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
  </div>
);

export default DateSeparator;
