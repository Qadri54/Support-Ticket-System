import { cookies } from "next/headers";
import type {
  PaginatedResponse,
  ResourceObject,
  Ticket,
  TicketStatus,
} from "@/lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const AUTH_COOKIE = "auth_token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Centralized fetch wrapper. Runs on the server (Server Components / Route
 * Handlers), attaches the Bearer token from the httpOnly cookie when present,
 * and never caches so status-filter changes always re-fetch.
 */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let errors: Record<string, string[]> | undefined;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object") {
        const parsed = body as { message?: string; errors?: Record<string, string[]> };
        if (parsed.message) message = parsed.message;
        errors = parsed.errors;
      }
    } catch {
      // response had no JSON body — keep the default message
    }
    throw new ApiError(message, res.status, errors);
  }

  return res.json() as Promise<T>;
}

interface GetTicketsParams {
  status?: TicketStatus;
  page?: number;
}

export function getTickets(
  params: GetTicketsParams = {},
): Promise<PaginatedResponse<Ticket>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<PaginatedResponse<Ticket>>(`/tickets${suffix}`);
}

export async function getTicket(id: number | string): Promise<Ticket> {
  const { data } = await apiFetch<ResourceObject<Ticket>>(`/tickets/${id}`);
  return data;
}

export { API_URL };
