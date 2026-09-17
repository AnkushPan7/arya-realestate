import { NextResponse } from "next/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { inquiries, projects } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const submitInquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().email("Enter a valid email").optional(),
  ),
  message: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().optional(),
  ),
  source: z
    .enum(["contact_form", "whatsapp", "project_page"])
    .default("contact_form"),
  projectId: z.number().int().positive().optional(),
});

const listInquiriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["new", "contacted", "closed"]).optional(),
});

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = listInquiriesSchema.safeParse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { page, limit, status } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions = status ? eq(inquiries.status, status) : undefined;
    const whereClause = conditions ? and(conditions) : undefined;

    const [countRow] = await db
      .select({ total: count() })
      .from(inquiries)
      .where(whereClause);

    const rows = await db
      .select({
        id: inquiries.id,
        name: inquiries.name,
        email: inquiries.email,
        phone: inquiries.phone,
        message: inquiries.message,
        source: inquiries.source,
        projectId: inquiries.projectId,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        projectTitle: projects.title,
      })
      .from(inquiries)
      .leftJoin(projects, eq(inquiries.projectId, projects.id))
      .where(whereClause)
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ data: rows, total: countRow?.total ?? 0 });
  } catch {
    return jsonError("Unable to load inquiries", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = submitInquirySchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: first }, { status: 400 });
    }

    const { name, phone, email, message, source, projectId } = parsed.data;

    const [row] = await db
      .insert(inquiries)
      .values({
        name,
        phone,
        email: email ?? null,
        message: message ?? null,
        source,
        ...(projectId !== undefined ? { projectId } : {}),
      })
      .returning({ id: inquiries.id });

    return NextResponse.json({ data: { id: row.id } }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit inquiry. Please try again." },
      { status: 500 },
    );
  }
}
