import Link from "next/link";
import { TicketForm } from "@/components/TicketForm";

export default function NewTicketPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← Back to tickets
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">
          New ticket
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Describe your issue and we&apos;ll get back to you.
        </p>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <TicketForm />
      </div>
    </div>
  );
}
