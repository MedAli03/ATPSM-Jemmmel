export default function TypingIndicator({ active }) {
  if (!active) return null;
  return (
    <div className="mt-3 flex justify-start text-xs text-slate-500" aria-live="polite">
      <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 shadow-sm dark:bg-slate-800 dark:text-slate-200">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.2s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 [animation-delay:-0.1s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
        </span>
        شخص ما يكتب…
      </span>
    </div>
  );
}
