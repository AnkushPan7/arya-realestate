import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email("Enter a valid email").optional(),
);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Enter a valid URL").optional(),
);

const updateSiteSettingsSchema = z.object({
  companyName: optionalString,
  logoUrl: optionalUrl,
  tagline: optionalString,
  metaDescription: optionalString,
  defaultOgImage: optionalUrl,
  whatsappNumber: optionalString,
  email: optionalEmail,
  googleReviewsPlaceId: optionalString,
  footerText: optionalString,
  copyrightText: optionalString,
});

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const [row] = await db.select().from(siteSettings).limit(1);
    return jsonData(row ?? null);
  } catch {
    return jsonError("Unable to load site settings", 500);
  }
}

export async function PUT(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = updateSiteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const updates = parsed.data;
    const now = new Date();

    const [existing] = await db.select().from(siteSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ ...updates, updatedAt: now })
        .where(eq(siteSettings.id, existing.id))
        .returning();

      return jsonData(updated);
    }

    const [created] = await db
      .insert(siteSettings)
      .values({
        companyName: updates.companyName ?? "Arya Real Estate",
        ...updates,
        updatedAt: now,
      })
      .returning();

    return jsonData(created);
  } catch {
    return jsonError("Unable to save site settings", 500);
  }
}
