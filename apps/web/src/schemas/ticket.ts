import { z } from "zod";

export const ticketSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "The subject field is required.")
    .max(255, "The subject may not be greater than 255 characters."),
  description: z
    .string()
    .trim()
    .min(1, "The description field is required.")
    .max(5000, "The description may not be greater than 5000 characters."),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

/**
 * Reshape a ZodError into the same `Record<field, string[]>` shape the
 * Laravel API uses for 422 responses, so client and server errors render
 * through the same UI.
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
