import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "arya_token";

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  sessionId: string;
}

/* ---- Password ---- */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ---- JWT ---- */

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/* ---- Session (Server Component / Layout) ---- */

/**
 * Verifies the current session from cookies.
 * Call this in admin layout.tsx — redirects to /login if invalid.
 */
export async function verifySession(): Promise<JWTPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = decodeToken(token);
  if (!payload) {
    redirect("/login");
  }

  // Validate session against DB
  const [user] = await db
    .select({ sessionId: users.sessionId })
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);

  if (!user || user.sessionId !== payload.sessionId) {
    redirect("/login");
  }

  return payload;
}

/* ---- API Route Auth Guard ---- */

/**
 * Use in protected API routes.
 * Returns the decoded payload or throws a Response with 401.
 * Also validates sessionId against the database (single-session logout).
 */
export async function requireAuth(request: Request): Promise<JWTPayload> {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(
    new RegExp(`${COOKIE_NAME}=([^;]+)`),
  );
  const token = tokenMatch?.[1];

  if (!token) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = decodeToken(token);
  if (!payload) {
    throw new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [user] = await db
    .select({ sessionId: users.sessionId })
    .from(users)
    .where(eq(users.id, payload.id))
    .limit(1);

  if (!user || user.sessionId !== payload.sessionId) {
    throw new Response(JSON.stringify({ error: "Session expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return payload;
}

export { COOKIE_NAME };
