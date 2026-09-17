import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { offices, socialLinks } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";
import { officeInputSchema } from "@/lib/validations/offices";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive("Invalid office ID");

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
    const office = await db.query.offices.findFirst({
      where: (table, { eq: eqFn }) => eqFn(table.id, parsedId.data),
      with: { socialLinks: true },
    });

    if (!office) {
      return jsonError("Office not found", 404);
    }

    return jsonData({
      ...office,
      socialLinks: [...office.socialLinks].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    });
  } catch {
    return jsonError("Unable to load office", 500);
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
    const parsed = officeInputSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [existing] = await db
      .select({ id: offices.id })
      .from(offices)
      .where(eq(offices.id, parsedId.data))
      .limit(1);

    if (!existing) {
      return jsonError("Office not found", 404);
    }

    const { socialLinks: links, ...officeData } = parsed.data;
    const now = new Date();

    const updated = await db.transaction(async (tx) => {
      await tx
        .update(offices)
        .set({ ...officeData, updatedAt: now })
        .where(eq(offices.id, parsedId.data));

      await tx
        .delete(socialLinks)
        .where(eq(socialLinks.officeId, parsedId.data));

      if (links.length > 0) {
        await tx.insert(socialLinks).values(
          links.map((link, index) => ({
            officeId: parsedId.data,
            platform: link.platform,
            url: link.url,
            displayOrder: link.displayOrder ?? index,
            isActive: link.isActive ?? true,
          })),
        );
      }

      return tx.query.offices.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.id, parsedId.data),
        with: { socialLinks: true },
      });
    });

    if (!updated) {
      return jsonError("Unable to update office", 500);
    }

    return jsonData(updated);
  } catch {
    return jsonError("Unable to update office", 500);
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
      .delete(offices)
      .where(eq(offices.id, parsedId.data))
      .returning({ id: offices.id });

    if (!deleted) {
      return jsonError("Office not found", 404);
    }

    return jsonData({ id: deleted.id });
  } catch {
    return jsonError("Unable to delete office", 500);
  }
}
