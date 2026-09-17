import { and, asc, desc, eq } from "drizzle-orm";
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
import {
  projectCreateSchema,
  projectStatusSchema,
  propertyTypeSchema,
  zoneSchema,
} from "@/lib/validations/projects";

export const dynamic = "force-dynamic";

function parseListFilters(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters: Record<string, unknown> = {};

  const zone = searchParams.get("zone");
  if (zone && zoneSchema.safeParse(zone).success) {
    filters.zone = zone;
  }

  const status = searchParams.get("status");
  if (status && projectStatusSchema.safeParse(status).success) {
    filters.status = status;
  }

  const propertyType = searchParams.get("propertyType");
  if (propertyType && propertyTypeSchema.safeParse(propertyType).success) {
    filters.propertyType = propertyType;
  }

  const featured = searchParams.get("featured");
  if (featured === "true") {
    filters.featured = true;
  }

  return filters;
}

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const filters = parseListFilters(request);
    const conditions = [];

    if (filters.zone) {
      conditions.push(eq(projects.zone, filters.zone as "east" | "west"));
    }
    if (filters.status) {
      conditions.push(
        eq(
          projects.status,
          filters.status as "upcoming" | "ongoing" | "completed",
        ),
      );
    }
    if (filters.propertyType) {
      conditions.push(
        eq(
          projects.propertyType,
          filters.propertyType as
            | "apartment"
            | "bungalow"
            | "commercial"
            | "industrial"
            | "plot"
            | "land",
        ),
      );
    }
    if (filters.featured) {
      conditions.push(eq(projects.isFeatured, true));
    }

    const rows = await db.query.projects.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { media: true },
      orderBy: [asc(projects.displayOrder), desc(projects.createdAt)],
    });

    const data = rows.map((project) => ({
      ...project,
      media: [...project.media].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    }));

    return jsonData(data);
  } catch {
    return jsonError("Unable to load projects", 500);
  }
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = projectCreateSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const slug = await getUniqueProjectSlug(parsed.data.title);
    const now = new Date();

    const [created] = await db
      .insert(projects)
      .values({
        ...parsed.data,
        slug,
        priceMin:
          parsed.data.priceMin != null ? String(parsed.data.priceMin) : null,
        priceMax:
          parsed.data.priceMax != null ? String(parsed.data.priceMax) : null,
        updatedAt: now,
      })
      .returning();

    return jsonData(created, 201);
  } catch {
    return jsonError("Unable to create project", 500);
  }
}
