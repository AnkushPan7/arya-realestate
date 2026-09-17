import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const idSchema = z.coerce.number().int().positive();

const updateInquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid inquiry ID", 400);
  }

  try {
    const body: unknown = await request.json();
    const parsed = updateInquiryStatusSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const [inquiry] = await db
      .update(inquiries)
      .set({ status: parsed.data.status })
      .where(eq(inquiries.id, parsedId.data))
      .returning();

    if (!inquiry) {
      return jsonError("Inquiry not found", 404);
    }

    return jsonData(inquiry);
  } catch {
    return jsonError("Unable to update inquiry", 500);
  }
}
