import Link from "next/link";
import { StatusFilter } from "@/components/StatusFilter";
import { TicketCard } from "@/components/TicketCard";
import { getTickets } from "@/lib/api";
import type { TicketStatus } from "@/lib/types";

const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved"];

function parseStatus(
  value: string | string[] | undefined,
): TicketStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_STATUSES.includes(raw as TicketStatus)
    ? (raw as TicketStatus)
    : undefined;
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildHref(status: TicketStatus | undefined, page: number): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolved = await searchParams;
  const status = parseStatus(resolved.status);
  const page = parsePage(resolved.page);

  const { data: tickets, meta } = await getTickets({ status, page });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Tickets</h1>
        <StatusFilter current={status} />
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500 dark:border-neutral-700">
          No tickets found.{" "}
          <Link
            href="/tickets/new"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Create one
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <TicketCard ticket={ticket} />
            </li>
          ))}
        </ul>
      )}

      {meta.last_page > 1 && (
        <nav className="flex items-center justify-between pt-2 text-sm">
          {meta.current_page > 1 ? (
            <Link
              href={buildHref(status, meta.current_page - 1)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              ← Previous
            </Link>
          ) : (
            <span className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
              ← Previous
            </span>
          )}

          <span className="text-neutral-500">
            Page {meta.current_page} of {meta.last_page}
          </span>

          {meta.current_page < meta.last_page ? (
            <Link
              href={buildHref(status, meta.current_page + 1)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Next →
            </Link>
          ) : (
            <span className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-400 dark:border-neutral-800 dark:text-neutral-600">
              Next →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
