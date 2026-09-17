import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";
import { getUniqueProjectSlug } from "@/lib/project-slug";
import { projectUpdateSchema } from "@/lib/validations/projects";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive("Invalid project ID");

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return validationError(parsedId.error);
  }

  try {
    const project = await db.query.projects.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, parsedId.data),
      with: { media: true, floorPlans: true },
    });

    if (!project) {
      return jsonError("Project not found", 404);
    }

    return jsonData({
      ...project,
      media: [...project.media].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
      floorPlans: [...project.floorPlans].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    });
  } catch {
    return jsonError("Unable to load project", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return validationError(parsedId.error);
  }

  try {
    const body: unknown = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parsedId.data))
      .limit(1);

    if (!existing) {
      return jsonError("Project not found", 404);
    }

    const updates: Record<string, unknown> = {
      ...parsed.data,
      updatedAt: new Date(),
    };

    if (parsed.data.priceMin !== undefined) {
      updates.priceMin =
        parsed.data.priceMin != null ? String(parsed.data.priceMin) : null;
    }
    if (parsed.data.priceMax !== undefined) {
      updates.priceMax =
        parsed.data.priceMax != null ? String(parsed.data.priceMax) : null;
    }

    if (parsed.data.title && parsed.data.title !== existing.title) {
      updates.slug = await getUniqueProjectSlug(
        parsed.data.title,
        parsedId.data,
      );
    }

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, parsedId.data))
      .returning();

    return jsonData(updated);
  } catch {
    return jsonError("Unable to update project", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return validationError(parsedId.error);
  }

  try {
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, parsedId.data))
      .returning({ id: projects.id });

    if (!deleted) {
      return jsonError("Project not found", 404);
    }

    return jsonData({ id: deleted.id });
  } catch {
    return jsonError("Unable to delete project", 500);
  }
}
