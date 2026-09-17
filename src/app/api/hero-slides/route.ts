import { asc, sql } from "drizzle-orm";
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

const createHeroSlideSchema = z.object({
  imageUrl: z.string().trim().url("Image URL is required"),
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

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const slides = await db
      .select()
      .from(heroSlides)
      .orderBy(asc(heroSlides.displayOrder));

    return jsonData(slides);
  } catch {
    return jsonError("Unable to load hero slides", 500);
  }
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = createHeroSlideSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { imageUrl, title, subtitle, ctaText, ctaLink, displayOrder, isActive } =
      parsed.data;

    let order = displayOrder;
    if (order === undefined) {
      const [row] = await db
        .select({
          maxOrder: sql<number>`coalesce(max(${heroSlides.displayOrder}), -1)`,
        })
        .from(heroSlides);
      order = (row?.maxOrder ?? -1) + 1;
    }

    const [slide] = await db
      .insert(heroSlides)
      .values({
        imageUrl,
        title: title ?? null,
        subtitle: subtitle ?? null,
        ctaText: ctaText ?? null,
        ctaLink: ctaLink ?? null,
        displayOrder: order,
        isActive: isActive ?? true,
      })
      .returning();

    return jsonData(slide, 201);
  } catch {
    return jsonError("Unable to create hero slide", 500);
  }
}
