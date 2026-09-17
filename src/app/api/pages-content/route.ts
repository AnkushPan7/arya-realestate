import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pagesContent } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const upsertPageContentSchema = z.object({
  pageKey: z.string().trim().min(1, "Page key is required"),
  title: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  content: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  metaTitle: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
  metaDescription: z
    .preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().nullable().optional(),
    )
    .optional(),
});

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const pages = await db
      .select()
      .from(pagesContent)
      .orderBy(asc(pagesContent.pageKey));

    return jsonData(pages);
  } catch {
    return jsonError("Unable to load pages content", 500);
  }
}

export async function PUT(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = upsertPageContentSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { pageKey, title, content, metaTitle, metaDescription } = parsed.data;

    const [existing] = await db
      .select({ id: pagesContent.id })
      .from(pagesContent)
      .where(eq(pagesContent.pageKey, pageKey))
      .limit(1);

    if (existing) {
      const [page] = await db
        .update(pagesContent)
        .set({
          title: title ?? null,
          content: content ?? null,
          metaTitle: metaTitle ?? null,
          metaDescription: metaDescription ?? null,
          updatedAt: new Date(),
        })
        .where(eq(pagesContent.pageKey, pageKey))
        .returning();

      return jsonData(page);
    }

    const [page] = await db
      .insert(pagesContent)
      .values({
        pageKey,
        title: title ?? null,
        content: content ?? null,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
      })
      .returning();

    return jsonData(page, 201);
  } catch {
    return jsonError("Unable to save page content", 500);
  }
}
