"use client";

import { useActionState, useState } from "react";
import {
  createTicketAction,
  type CreateTicketState,
} from "@/app/tickets/new/actions";
import { formatZodErrors, ticketSchema } from "@/schemas/ticket";

const initialState: CreateTicketState = {};

export function TicketForm() {
  const [serverState, formAction, isPending] = useActionState(
    createTicketAction,
    initialState,
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {},
  );

  // Client-side Zod validation runs before the server action; the Laravel
  // FormRequest remains the authoritative validation on the server.
  function handleAction(formData: FormData) {
    const result = ticketSchema.safeParse({
      subject: formData.get("subject"),
      description: formData.get("description"),
    });

    if (!result.success) {
      setClientErrors(formatZodErrors(result.error));
      return;
    }

    setClientErrors({});
    formAction(formData);
  }

  function fieldError(name: string): string | undefined {
    return clientErrors[name]?.[0] ?? serverState.errors?.[name]?.[0];
  }

  return (
    <form action={handleAction} className="space-y-5" noValidate>
      {serverState.message && !serverState.errors && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {serverState.message}
        </p>
      )}

      <div>
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          aria-invalid={fieldError("subject") ? true : undefined}
          aria-describedby={fieldError("subject") ? "subject-error" : undefined}
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 aria-[invalid]:border-red-400 dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Brief summary of the issue"
        />
        {fieldError("subject") && (
          <p id="subject-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {fieldError("subject")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          aria-invalid={fieldError("description") ? true : undefined}
          aria-describedby={
            fieldError("description") ? "description-error" : undefined
          }
          className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 aria-[invalid]:border-red-400 dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="Describe what happened and what you expected"
        />
        {fieldError("description") && (
          <p
            id="description-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {fieldError("description")}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
