import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000); // auto-close in 3s
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" dir="rtl">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-xl shadow text-sm ${toastTone(t.type)}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function toastTone(type = "success") {
  const map = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-sky-600 text-white",
    warning: "bg-amber-400 text-slate-900",
  };
  return map[type] || map.success;
}
