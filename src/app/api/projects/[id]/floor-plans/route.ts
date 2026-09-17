import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projectFloorPlans, projects } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";
import {
  projectFloorPlanDeleteSchema,
  projectFloorPlanInputSchema,
} from "@/lib/validations/projects";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive("Invalid project ID");

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getProjectId(id: string) {
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: validationError(parsedId.error) } as const;
  }

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, parsedId.data))
    .limit(1);

  if (!project) {
    return { error: jsonError("Project not found", 404) } as const;
  }

  return { projectId: parsedId.data } as const;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id } = await context.params;
  const projectResult = await getProjectId(id);
  if ("error" in projectResult) return projectResult.error;

  try {
    const body: unknown = await request.json();
    const parsed = projectFloorPlanInputSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [created] = await db
      .insert(projectFloorPlans)
      .values({
        projectId: projectResult.projectId,
        title: parsed.data.title,
        imageUrl: parsed.data.imageUrl,
        displayOrder: parsed.data.displayOrder ?? 0,
      })
      .returning();

    return jsonData(created, 201);
  } catch {
    return jsonError("Unable to add floor plan", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id } = await context.params;
  const projectResult = await getProjectId(id);
  if ("error" in projectResult) return projectResult.error;

  try {
    const body: unknown = await request.json();
    const parsed = projectFloorPlanDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [deleted] = await db
      .delete(projectFloorPlans)
      .where(
        and(
          eq(projectFloorPlans.id, parsed.data.floorPlanId),
          eq(projectFloorPlans.projectId, projectResult.projectId),
        ),
      )
      .returning({ id: projectFloorPlans.id });

    if (!deleted) {
      return jsonError("Floor plan not found", 404);
    }

    return jsonData({ id: deleted.id });
  } catch {
    return jsonError("Unable to delete floor plan", 500);
  }
}
