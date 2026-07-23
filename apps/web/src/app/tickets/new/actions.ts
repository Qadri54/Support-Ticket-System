"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import type { ResourceObject, Ticket } from "@/lib/types";

export interface CreateTicketState {
  errors?: Record<string, string[]>;
  message?: string;
}

/**
 * Server Action for creating a ticket. Posts to the Laravel API, which runs
 * the authoritative FormRequest validation; 422 errors are returned to the
 * form for per-field display. On success we redirect to the new ticket.
 */
export async function createTicketAction(
  _prevState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const payload = {
    subject: String(formData.get("subject") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const res = await fetch(`${API_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (res.status === 422) {
    const body = (await res.json()) as {
      message: string;
      errors: Record<string, string[]>;
    };
    return { errors: body.errors, message: body.message };
  }

  if (!res.ok) {
    return { message: "Something went wrong while creating the ticket. Please try again." };
  }

  const { data } = (await res.json()) as ResourceObject<Ticket>;
  redirect(`/tickets/${data.id}`);
}
