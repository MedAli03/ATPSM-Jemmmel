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
            className={`px-4 py-2 rounded-xl shadow text-white text-sm ${
              t.type === "error" ? "bg-rose-600" : "bg-emerald-600"
            }`}
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
