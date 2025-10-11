// src/components/common/Modal.jsx
import { useEffect, useRef } from "react";

/**
 * Generic modal (RTL-ready)
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string | node
 *  - description?: string | node
 *  - children: modal body
 *  - footer?: node (buttons/actions)
 *  - size?: "sm" | "md" | "lg" | "xl"
 *  - initialFocusRef?: React.RefObject (optional: element to autofocus)
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  initialFocusRef,
}) {
  const containerRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Simple autofocus
  useEffect(() => {
    if (!open) return;
    const el =
      initialFocusRef?.current ||
      containerRef.current?.querySelector?.(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    el?.focus?.();
  }, [open, initialFocusRef]);

  if (!open) return null;

  const maxW =
    size === "sm"
      ? "max-w-sm"
      : size === "lg"
      ? "max-w-2xl"
      : size === "xl"
      ? "max-w-4xl"
      : "max-w-md"; // md

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={containerRef}
        className={`relative w-full ${maxW} bg-white rounded-2xl shadow-lg overflow-hidden`}
      >
        {(title || description) && (
          <div className="px-5 py-4 border-b bg-gray-50">
            {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
            {description ? <p className="text-xs text-gray-500 mt-1">{description}</p> : null}
          </div>
        )}

        <div className="p-5">{children}</div>

        {footer ? <div className="px-5 py-4 border-t bg-gray-50">{footer}</div> : null}

        {/* Close button (top-left in RTL) */}
        <button
          type="button"
          aria-label="إغلاق"
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
