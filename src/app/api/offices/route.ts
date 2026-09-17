import { asc } from "drizzle-orm";
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

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const rows = await db.query.offices.findMany({
      with: { socialLinks: true },
      orderBy: [asc(offices.displayOrder)],
    });

    const data = rows.map((office) => ({
      ...office,
      socialLinks: [...office.socialLinks].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    }));

    return jsonData(data);
  } catch {
    return jsonError("Unable to load offices", 500);
  }
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = officeInputSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { socialLinks: links, ...officeData } = parsed.data;
    const now = new Date();

    const created = await db.transaction(async (tx) => {
      const [office] = await tx
        .insert(offices)
        .values({ ...officeData, updatedAt: now })
        .returning();

      if (links.length > 0) {
        await tx.insert(socialLinks).values(
          links.map((link, index) => ({
            officeId: office.id,
            platform: link.platform,
            url: link.url,
            displayOrder: link.displayOrder ?? index,
            isActive: link.isActive ?? true,
          })),
        );
      }

      return tx.query.offices.findFirst({
        where: (table, { eq: eqFn }) => eqFn(table.id, office.id),
        with: { socialLinks: true },
      });
    });

    if (!created) {
      return jsonError("Unable to create office", 500);
    }

    return jsonData(created, 201);
  } catch {
    return jsonError("Unable to create office", 500);
  }
}
