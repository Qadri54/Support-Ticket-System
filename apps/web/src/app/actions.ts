"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { API_URL, AUTH_COOKIE } from "@/lib/api";

/** Revoke the token server-side and clear the httpOnly cookie. */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // best-effort revocation; clear the cookie regardless
    }
  }

  cookieStore.delete(AUTH_COOKIE);
  revalidatePath("/", "layout");
}
