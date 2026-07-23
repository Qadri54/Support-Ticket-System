"use server";

import { revalidatePath } from "next/cache";
import {
  addTicketResponse,
  ApiError,
  updateTicketStatus,
} from "@/lib/api";
import type { TicketStatus } from "@/lib/types";

export interface AdminActionState {
  error?: string;
  ok?: boolean;
}

const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved"];

function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const firstField = error.errors && Object.values(error.errors)[0]?.[0];
    return firstField ?? error.message;
  }
  return fallback;
}

/** Admin: update a ticket's status. Bound with the ticket id in the page. */
export async function updateStatusAction(
  id: number,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const status = String(formData.get("status") ?? "");
  if (!VALID_STATUSES.includes(status as TicketStatus)) {
    return { error: "Please choose a valid status." };
  }

  try {
    await updateTicketStatus(id, status as TicketStatus);
    revalidatePath(`/tickets/${id}`);
    return { ok: true };
  } catch (error) {
    return { error: messageFrom(error, "Failed to update status.") };
  }
}

/** Admin: add a response to a ticket. Bound with the ticket id in the page. */
export async function addResponseAction(
  id: number,
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const body = String(formData.get("body") ?? "").trim();
  if (body.length === 0) {
    return { error: "Response cannot be empty." };
  }

  try {
    await addTicketResponse(id, body);
    revalidatePath(`/tickets/${id}`);
    return { ok: true };
  } catch (error) {
    return { error: messageFrom(error, "Failed to add response.") };
  }
}
