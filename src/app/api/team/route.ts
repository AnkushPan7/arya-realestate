import { asc, sql } from "drizzle-orm";
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

const createTeamMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  role: z.string().trim().min(1, "Role is required"),
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

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const members = await db
      .select()
      .from(teamMembers)
      .orderBy(asc(teamMembers.displayOrder));

    return jsonData(members);
  } catch {
    return jsonError("Unable to load team members", 500);
  }
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = createTeamMemberSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, role, bio, photoUrl, displayOrder, isActive } = parsed.data;

    let order = displayOrder;
    if (order === undefined) {
      const [row] = await db
        .select({
          maxOrder: sql<number>`coalesce(max(${teamMembers.displayOrder}), -1)`,
        })
        .from(teamMembers);
      order = (row?.maxOrder ?? -1) + 1;
    }

    const [member] = await db
      .insert(teamMembers)
      .values({
        name,
        role,
        bio: bio ?? null,
        photoUrl: photoUrl ?? null,
        displayOrder: order,
        isActive: isActive ?? true,
      })
      .returning();

    return jsonData(member, 201);
  } catch {
    return jsonError("Unable to create team member", 500);
  }
}
