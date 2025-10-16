const ErrorState = ({ title = "حدث خطأ", description = "تعذر تحميل البيانات. حاول مجدداً." , onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-rose-100 bg-rose-50/70 p-8 text-center text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
    <span className="text-2xl" role="img" aria-label="error">
      ⚠️
    </span>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="max-w-sm text-sm leading-relaxed">{description}</p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
      >
        إعادة المحاولة
      </button>
    ) : null}
  </div>
);

export default ErrorState;
