"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  leaving: boolean;
}

interface ToastContextValue {
  notify: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIMATION_MS = 200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Trigger the exit animation, then remove after it finishes.
  const startDismiss = useCallback(
    (id: number) => {
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, leaving: true } : toast,
        ),
      );
      setTimeout(() => remove(id), EXIT_ANIMATION_MS);
    },
    [remove],
  );

  const notify = useCallback((message: string, type: ToastType = "success") => {
    setToasts((current) => [
      ...current,
      { id: Date.now() + Math.random(), type, message, leaving: false },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={startDismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isSuccess = toast.type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border shadow-xl backdrop-blur ${
        toast.leaving ? "toast-leave" : "toast-enter"
      } ${
        isSuccess
          ? "border-green-300/70 bg-green-50/95 text-green-900 dark:border-green-500/40 dark:bg-green-950/80 dark:text-green-100"
          : "border-red-300/70 bg-red-50/95 text-red-900 dark:border-red-500/40 dark:bg-red-950/80 dark:text-red-100"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
            isSuccess ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isSuccess ? "✓" : "!"}
        </span>
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-current opacity-50 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </svg>
        </button>
      </div>
      {!toast.leaving && (
        <div
          className={`toast-progress h-0.5 ${
            isSuccess ? "bg-green-500/70" : "bg-red-500/70"
          }`}
          style={{ "--toast-duration": `${AUTO_DISMISS_MS}ms` } as React.CSSProperties}
        />
      )}
    </div>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
