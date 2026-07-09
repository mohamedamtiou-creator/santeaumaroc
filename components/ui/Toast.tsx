"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let counter = 0;

const COLORS: Record<ToastType, string> = {
  success: "bg-secondary-600",
  error:   "bg-rose-600",
  info:    "bg-primary-600",
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5L13 4"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round">
      <path d="M3 3l10 10M13 3 3 13"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0" aria-hidden="true" strokeLinecap="round">
      <circle cx="8" cy="8" r="7"/>
      <path d="M8 7v5M8 5v.5"/>
    </svg>
  ),
};

function ToastEntry({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-center gap-3 ${COLORS[item.type]} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full`}
    >
      {ICONS[item.type]}
      <span className="flex-1">{item.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Fermer la notification"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5" aria-hidden="true" strokeLinecap="round">
          <path d="M3 3l10 10M13 3 3 13"/>
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = String(++counter);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-6 end-4 z-[9999] flex flex-col gap-2 pointer-events-none"
          aria-label="Notifications"
        >
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastEntry item={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
