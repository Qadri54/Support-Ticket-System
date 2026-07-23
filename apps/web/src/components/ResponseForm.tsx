"use client";

import { useActionState, useEffect, useRef } from "react";
import type { AdminActionState } from "@/app/tickets/[id]/actions";

type Action = (
  prev: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

export function ResponseForm({ action }: { action: Action }) {
  const [state, formAction, isPending] = useActionState<
    AdminActionState,
    FormData
  >(action, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea after a successful submit.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <label htmlFor="body" className="block text-sm font-medium">
        Add a response
      </label>
      <textarea
        id="body"
        name="body"
        rows={3}
        required
        placeholder="Write a reply to this ticket…"
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending…" : "Add response"}
      </button>
    </form>
  );
}
