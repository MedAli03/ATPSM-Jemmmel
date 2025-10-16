const EmptyState = ({ icon = "💬", title, description }) => (
  <div className="flex h-60 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/40 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
    <span className="text-3xl" role="img" aria-label="empty">
      {icon}
    </span>
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
    {description ? <p className="max-w-sm text-sm leading-relaxed">{description}</p> : null}
  </div>
);

export default EmptyState;
