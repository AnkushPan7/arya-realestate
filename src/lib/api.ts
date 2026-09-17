import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { requireAuth } from "@/lib/auth";

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: error.issues[0]?.message ?? "Invalid input" },
    { status: 400 },
  );
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/** Require auth; returns payload or a 401 Response */
export async function ensureAuth(request: Request) {
  try {
    return await requireAuth(request);
  } catch (response) {
    if (response instanceof Response) return response;
    return jsonError("Unauthorized", 401);
  }
}

export function isAuthFailure(
  result: Awaited<ReturnType<typeof ensureAuth>>,
): result is Response {
  return result instanceof Response;
}
