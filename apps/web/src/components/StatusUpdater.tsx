"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/app/tickets/[id]/actions";
import type { TicketStatus } from "@/lib/types";

const OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

export function StatusUpdater({
  action,
  current,
}: {
  action: Action;
  current: TicketStatus;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(action, {});

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="status" className="block text-sm font-medium">
          Change status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={current}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2.5 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Updating…" : "Update"}
      </button>
      {state.error && (
        <p
          role="alert"
          className="w-full text-sm text-red-600 dark:text-red-400 sm:mt-1"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
