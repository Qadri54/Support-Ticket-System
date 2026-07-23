// Manually-written types for the Laravel API responses.
// Kept in sync with app/Http/Resources/* on the API side. No `any`.

export type TicketStatus = "open" | "in_progress" | "resolved";
export type UserRole = "user" | "admin";

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface TicketResponse {
  id: number;
  body: string;
  user?: ApiUser;
  created_at: string | null;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  status_label: string;
  user?: ApiUser;
  responses?: TicketResponse[];
  responses_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

// Laravel API Resource wrappers.
export interface ResourceObject<T> {
  data: T;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

// Standard Laravel validation error shape (422).
export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}
