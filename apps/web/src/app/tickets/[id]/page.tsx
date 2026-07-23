import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, getTicket } from "@/lib/api";
import type { Ticket } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ticket: Ticket;
  try {
    ticket = await getTicket(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const responses = ticket.responses ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← Back to tickets
        </Link>
      </div>

      <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {ticket.subject}
          </h1>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span>#{ticket.id}</span>
          {ticket.user && <span>opened by {ticket.user.name}</span>}
          {ticket.created_at && <span>{formatDate(ticket.created_at)}</span>}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {ticket.description}
        </p>
      </article>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Responses ({responses.length})
        </h2>

        {responses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
            No responses yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {responses.map((response) => (
              <li
                key={response.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {response.user?.name ?? "Support"}
                  </span>
                  {response.created_at && (
                    <span>{formatDate(response.created_at)}</span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {response.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
