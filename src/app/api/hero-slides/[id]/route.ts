import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { heroSlides } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive();

const updateHeroSlideSchema = z.object({
  imageUrl: z.string().trim().url().optional(),
  title: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  subtitle: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  ctaText: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  ctaLink: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
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
    return jsonError("Invalid slide ID", 400);
  }

  try {
    const [slide] = await db
      .select()
      .from(heroSlides)
      .where(eq(heroSlides.id, parsedId.data))
      .limit(1);

    if (!slide) {
      return jsonError("Hero slide not found", 404);
    }

    return jsonData(slide);
  } catch {
    return jsonError("Unable to load hero slide", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid slide ID", 400);
  }

  try {
    const body: unknown = await request.json();
    const parsed = updateHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const [slide] = await db
      .update(heroSlides)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(heroSlides.id, parsedId.data))
      .returning();

    if (!slide) {
      return jsonError("Hero slide not found", 404);
    }

    return jsonData(slide);
  } catch {
    return jsonError("Unable to update hero slide", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid slide ID", 400);
  }

  try {
    const [slide] = await db
      .delete(heroSlides)
      .where(eq(heroSlides.id, parsedId.data))
      .returning({ id: heroSlides.id });

    if (!slide) {
      return jsonError("Hero slide not found", 404);
    }

    return jsonData({ id: slide.id });
  } catch {
    return jsonError("Unable to delete hero slide", 500);
  }
}
