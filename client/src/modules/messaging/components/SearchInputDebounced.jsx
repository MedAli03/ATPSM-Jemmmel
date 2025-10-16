import { forwardRef, useEffect, useState } from "react";

const SearchInputDebounced = forwardRef(function SearchInputDebounced(
  { value, onChange, onImmediateChange, delay = 400, placeholder = "", className = "", label = "" },
  ref
) {
  const [internal, setInternal] = useState(value || "");

  useEffect(() => {
    setInternal(value || "");
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) onChange(internal);
    }, delay);
    return () => clearTimeout(handler);
  }, [internal, delay, onChange]);

  return (
    <label className="w-full text-right">
      {label ? <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span> : null}
      <input
        ref={ref}
        type="search"
        value={internal}
        onChange={(event) => {
          setInternal(event.target.value);
          onImmediateChange?.(event.target.value);
        }}
        placeholder={placeholder}
        className={`w-full rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-primary-300 ${className}`}
        aria-label={label || placeholder || "بحث"}
      />
    </label>
  );
});

export default SearchInputDebounced;
