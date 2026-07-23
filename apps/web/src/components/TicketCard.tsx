import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import type { Ticket } from "@/lib/types";

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-blue-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-medium leading-snug">{ticket.subject}</h2>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
        {ticket.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-500">
        <span>#{ticket.id}</span>
        {ticket.user && <span>by {ticket.user.name}</span>}
        {typeof ticket.responses_count === "number" && (
          <span>
            {ticket.responses_count}{" "}
            {ticket.responses_count === 1 ? "response" : "responses"}
          </span>
        )}
      </div>
    </Link>
  );
}
