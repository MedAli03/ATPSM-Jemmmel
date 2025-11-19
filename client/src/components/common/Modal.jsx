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
 *  - size?: "sm" | "md" | "lg" | "xl" | "full"
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
    if (el && typeof el.focus === "function") {
      el.focus();
    } else if (containerRef.current && typeof containerRef.current.focus === "function") {
      containerRef.current.focus();
    }
  }, [open, initialFocusRef]);

  if (!open) return null;

  const maxW =
    size === "sm"
      ? "max-w-sm"
      : size === "lg"
      ? "max-w-2xl"
      : size === "xl"
      ? "max-w-4xl"
      : size === "full"
      ? "max-w-5xl"
      : "max-w-md"; // md

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-10"
      dir="rtl"
      role="dialog"
      aria-modal={true}
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={containerRef}
        tabIndex={-1}
        className={`relative flex w-full ${maxW} max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-lg`}
      >
        {(title || description) && (
          <div className="border-b bg-gray-50 px-5 py-4">
            {title ? <h3 className="text-base font-semibold text-gray-900">{title}</h3> : null}
            {description ? <p className="text-xs text-gray-500 mt-1">{description}</p> : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>

        {footer ? <div className="border-t bg-gray-50 px-5 py-4 sm:px-6">{footer}</div> : null}

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
