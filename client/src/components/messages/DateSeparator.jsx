import { formatDateLabel } from "../../utils/relativeTime";

export default function DateSeparator({ date }) {
  return (
    <div className="my-4 flex items-center justify-center">
      <div className="flex items-center gap-3 text-xs text-slate-500 before:block before:h-px before:w-10 before:bg-slate-200 after:block after:h-px after:w-10 after:bg-slate-200 dark:text-slate-300 dark:before:bg-slate-700 dark:after:bg-slate-700">
        <span>{formatDateLabel(date)}</span>
      </div>
    </div>
  );
}
