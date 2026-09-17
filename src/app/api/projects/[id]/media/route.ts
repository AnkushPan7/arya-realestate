import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projectMedia, projects } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";
import {
  projectMediaDeleteSchema,
  projectMediaInputSchema,
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
    const parsed = projectMediaInputSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { projectId } = projectResult;

    const created = await db.transaction(async (tx) => {
      if (parsed.data.isPrimary) {
        await tx
          .update(projectMedia)
          .set({ isPrimary: false })
          .where(eq(projectMedia.projectId, projectId));
      }

      const [media] = await tx
        .insert(projectMedia)
        .values({
          projectId,
          url: parsed.data.url,
          mediaType: parsed.data.mediaType,
          altText: parsed.data.altText ?? null,
          caption: parsed.data.caption ?? null,
          isPrimary: parsed.data.isPrimary ?? false,
          displayOrder: parsed.data.displayOrder ?? 0,
        })
        .returning();

      return media;
    });

    return jsonData(created, 201);
  } catch {
    return jsonError("Unable to add project media", 500);
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
    const parsed = projectMediaDeleteSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [deleted] = await db
      .delete(projectMedia)
      .where(
        and(
          eq(projectMedia.id, parsed.data.mediaId),
          eq(projectMedia.projectId, projectResult.projectId),
        ),
      )
      .returning({ id: projectMedia.id });

    if (!deleted) {
      return jsonError("Media not found", 404);
    }

    return jsonData({ id: deleted.id });
  } catch {
    return jsonError("Unable to delete project media", 500);
  }
}
