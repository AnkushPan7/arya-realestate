import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { teamMembers } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive();

const updateTeamMemberSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  bio: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  photoUrl: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().url().nullable().optional(),
    )
    .optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid team member ID", 400);
  }

  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.id, parsedId.data))
      .limit(1);

    if (!member) {
      return jsonError("Team member not found", 404);
    }

    return jsonData(member);
  } catch {
    return jsonError("Unable to load team member", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid team member ID", 400);
  }

  try {
    const body: unknown = await request.json();
    const parsed = updateTeamMemberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const [member] = await db
      .update(teamMembers)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(teamMembers.id, parsedId.data))
      .returning();

    if (!member) {
      return jsonError("Team member not found", 404);
    }

    return jsonData(member);
  } catch {
    return jsonError("Unable to update team member", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid team member ID", 400);
  }

  try {
    const [member] = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, parsedId.data))
      .returning({ id: teamMembers.id });

    if (!member) {
      return jsonError("Team member not found", 404);
    }

    return jsonData({ id: member.id });
  } catch {
    return jsonError("Unable to delete team member", 500);
  }
}
