"use client";

import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Focus the confirm button and wire Escape-to-cancel while open. The dialog
  // stays mounted (hidden via `inert` + opacity) so enter/exit are pure CSS
  // transitions.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const confirmColor =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-600"
      : "bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600";

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        onClick={onCancel}
        aria-hidden
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
      />
      <div
        className={`relative w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl transition-all duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900 ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <h2 id="confirm-title" className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmColor}`}
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
