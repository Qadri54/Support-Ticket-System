import { NextResponse, type NextRequest } from "next/server";
import { API_URL, AUTH_COOKIE } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data: unknown = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const { token, user } = data as LoginResponse;
  const response = NextResponse.json({ user });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
