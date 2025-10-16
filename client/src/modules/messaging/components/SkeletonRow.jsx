const SkeletonRow = ({ density = "comfortable" }) => (
  <div
    className={`my-2 animate-pulse rounded-3xl bg-slate-100/70 dark:bg-slate-800/70 ${density === "compact" ? "h-20" : "h-24"}`}
  />
);

export default SkeletonRow;
