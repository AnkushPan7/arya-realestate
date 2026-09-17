import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  blogPosts,
  offices,
  pagesContent,
  heroSlides,
  projectFloorPlans,
  projectMedia,
  projects,
  siteSettings,
  teamMembers,
  users,
} from "@/db/schema";
import type { BlogCategory, SampleBlogPost } from "@/lib/sample-blog";
import type { SampleProject } from "@/lib/sample-projects";
import { OFFICES, SITE_PHONE } from "@/lib/site";
import { formatPrice } from "@/lib/utils";

/* ---------------------------------------------------------------------- */
/* Shared mappers                                                          */
/* ---------------------------------------------------------------------- */

type ProjectRow = typeof projects.$inferSelect;
type ProjectMediaRow = typeof projectMedia.$inferSelect;
type ProjectFloorPlanRow = typeof projectFloorPlans.$inferSelect;

function toDisplayPrice(row: ProjectRow): string {
  if (row.displayPrice) return row.displayPrice;

  const min = row.priceMin != null ? Number(row.priceMin) : null;
  const max = row.priceMax != null ? Number(row.priceMax) : null;

  if (min && max && min !== max) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min) return `${formatPrice(min)} onwards`;
  if (max) return `Up to ${formatPrice(max)}`;
  return "Price on request";
}

/** DB `description` is a single text field; split into paragraphs like the sample shape. */
function toDescriptionParagraphs(content: string | null): string[] | undefined {
  if (!content) return undefined;
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [content.trim()];
}

function mapProjectRow(
  row: ProjectRow,
  media: ProjectMediaRow[] = [],
  floorPlans: ProjectFloorPlanRow[] = [],
): SampleProject {
  const sortedMedia = [...media].sort((a, b) => a.displayOrder - b.displayOrder);
  const primary = sortedMedia.find((m) => m.isPrimary) ?? sortedMedia[0];
  const gallery = sortedMedia.map((m) => ({
    url: m.url,
    altText: m.altText ?? `${row.title} photo`,
  }));

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    zone: row.zone,
    status: row.status,
    propertyType: row.propertyType,
    displayPrice: toDisplayPrice(row),
    bhkOptions: row.bhkOptions ?? [],
    location: row.location,
    primaryImageUrl: primary?.url ?? null,
    plotArea: row.plotArea ?? undefined,
    possessionDate: row.possessionDate ?? undefined,
    reraNumber: row.reraNumber ?? undefined,
    description: toDescriptionParagraphs(row.description),
    features: row.features ?? undefined,
    floorPlans: floorPlans
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((fp) => ({ title: fp.title, imageUrl: fp.imageUrl })),
    videoUrl: row.videoUrl,
    gallery,
  };
}

type BlogRow = typeof blogPosts.$inferSelect & { authorName?: string | null };

/** Very small markdown-ish renderer: blank-line paragraphs, `## `/`### ` headings, `> ` quotes. */
function parseContentBlocks(content: string | null): SampleBlogPost["content"] {
  if (!content) return [];

  return content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("### ")) {
        return { type: "h3" as const, text: block.slice(4).trim() };
      }
      if (block.startsWith("## ")) {
        return { type: "h2" as const, text: block.slice(3).trim() };
      }
      if (block.startsWith("> ")) {
        return { type: "blockquote" as const, text: block.slice(2).trim() };
      }
      return { type: "p" as const, text: block };
    });
}

export function categoryLabelFor(category: string | null): string {
  if (!category) return "General";
  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function mapBlogRow(row: BlogRow): SampleBlogPost {
  return {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    category: (row.category ?? "market-updates") as BlogCategory,
    categoryLabel: categoryLabelFor(row.category),
    coverImageUrl: row.coverImageUrl,
    author: row.authorName ?? "Arya Real Estate Desk",
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    readTimeMinutes: row.readTimeMinutes ?? 3,
    tags: row.tags ?? [],
    content: parseContentBlocks(row.content),
  };
}

/* ---------------------------------------------------------------------- */
/* Hero slides                                                             */
/* ---------------------------------------------------------------------- */

export async function getActiveHeroSlides() {
  return db
    .select()
    .from(heroSlides)
    .where(eq(heroSlides.isActive, true))
    .orderBy(asc(heroSlides.displayOrder));
}

/* ---------------------------------------------------------------------- */
/* Site settings                                                           */
/* ---------------------------------------------------------------------- */

export async function getSiteSettings() {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row ?? null;
}

/* ---------------------------------------------------------------------- */
/* Offices                                                                  */
/* ---------------------------------------------------------------------- */

export async function getOfficesWithSocial() {
  const rows = await db.query.offices.findMany({
    where: eq(offices.isActive, true),
    with: { socialLinks: true },
    orderBy: [asc(offices.displayOrder)],
  });

  return rows.map((office) => ({
    ...office,
    socialLinks: office.socialLinks
      .filter((link) => link.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  }));
}

export type PublicOffice = Awaited<ReturnType<typeof getOfficesWithSocial>>[number];

export type ResolvedOffice = {
  name: string;
  addressShort: string;
  phone: string;
} | null;

/** Best-effort match of a zone ("east"/"west") to a DB office, with a static fallback. */
export function resolveOfficeForZone(
  offices: PublicOffice[],
  zone: "east" | "west",
): ResolvedOffice {
  const match =
    offices.find((office) => office.name.toLowerCase().includes(zone)) ??
    offices[0];

  if (match) {
    return {
      name: match.name,
      addressShort: match.address,
      phone: match.phoneNumbers?.[0] ?? SITE_PHONE,
    };
  }

  const fallback = OFFICES.find((office) => office.id === zone);
  return fallback
    ? {
        name: fallback.shortName,
        addressShort: fallback.addressShort,
        phone: fallback.phones[0],
      }
    : null;
}

/* ---------------------------------------------------------------------- */
/* Pages content                                                           */
/* ---------------------------------------------------------------------- */

export async function getPageContent(pageKey: string) {
  const [row] = await db
    .select()
    .from(pagesContent)
    .where(eq(pagesContent.pageKey, pageKey))
    .limit(1);
  return row ?? null;
}

/* ---------------------------------------------------------------------- */
/* Team                                                                     */
/* ---------------------------------------------------------------------- */

export async function getActiveTeamMembers() {
  return db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(asc(teamMembers.displayOrder));
}

/* ---------------------------------------------------------------------- */
/* Projects                                                                 */
/* ---------------------------------------------------------------------- */

async function loadMediaAndFloorPlans(projectIds: number[]) {
  if (projectIds.length === 0) {
    return { mediaByProject: new Map<number, ProjectMediaRow[]>(), floorPlansByProject: new Map<number, ProjectFloorPlanRow[]>() };
  }

  const [mediaRows, floorPlanRows] = await Promise.all([
    db.query.projectMedia.findMany({
      where: (table, { inArray }) => inArray(table.projectId, projectIds),
    }),
    db.query.projectFloorPlans.findMany({
      where: (table, { inArray }) => inArray(table.projectId, projectIds),
    }),
  ]);

  const mediaByProject = new Map<number, ProjectMediaRow[]>();
  for (const media of mediaRows) {
    const list = mediaByProject.get(media.projectId) ?? [];
    list.push(media);
    mediaByProject.set(media.projectId, list);
  }

  const floorPlansByProject = new Map<number, ProjectFloorPlanRow[]>();
  for (const plan of floorPlanRows) {
    const list = floorPlansByProject.get(plan.projectId) ?? [];
    list.push(plan);
    floorPlansByProject.set(plan.projectId, list);
  }

  return { mediaByProject, floorPlansByProject };
}

export async function getFeaturedProjects(limit = 3): Promise<SampleProject[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.isFeatured, true))
    .orderBy(asc(projects.displayOrder), desc(projects.createdAt))
    .limit(limit);

  const pool =
    rows.length > 0
      ? rows
      : await db
          .select()
          .from(projects)
          .orderBy(asc(projects.displayOrder), desc(projects.createdAt))
          .limit(limit);

  const { mediaByProject, floorPlansByProject } = await loadMediaAndFloorPlans(
    pool.map((p) => p.id),
  );

  return pool.map((row) =>
    mapProjectRow(row, mediaByProject.get(row.id), floorPlansByProject.get(row.id)),
  );
}

export type ProjectListFilters = {
  zone?: "east" | "west";
  status?: "upcoming" | "ongoing" | "completed";
  propertyType?: ProjectRow["propertyType"];
};

export async function getProjectsFiltered(
  filters: ProjectListFilters = {},
): Promise<SampleProject[]> {
  const conditions = [];
  if (filters.zone) conditions.push(eq(projects.zone, filters.zone));
  if (filters.status) conditions.push(eq(projects.status, filters.status));
  if (filters.propertyType) {
    conditions.push(eq(projects.propertyType, filters.propertyType));
  }

  const rows = await db
    .select()
    .from(projects)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(projects.displayOrder), desc(projects.createdAt));

  const { mediaByProject, floorPlansByProject } = await loadMediaAndFloorPlans(
    rows.map((p) => p.id),
  );

  return rows.map((row) =>
    mapProjectRow(row, mediaByProject.get(row.id), floorPlansByProject.get(row.id)),
  );
}

export async function getProjectBySlugZone(
  slug: string,
  zone: "east" | "west",
): Promise<SampleProject | null> {
  const [row] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.zone, zone)))
    .limit(1);

  if (!row) return null;

  const { mediaByProject, floorPlansByProject } = await loadMediaAndFloorPlans([row.id]);

  return mapProjectRow(row, mediaByProject.get(row.id), floorPlansByProject.get(row.id));
}

export async function getRelatedProjects(
  slug: string,
  zone: "east" | "west",
  limit = 3,
): Promise<SampleProject[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.zone, zone), ne(projects.slug, slug)))
    .orderBy(asc(projects.displayOrder), desc(projects.createdAt))
    .limit(limit);

  const { mediaByProject, floorPlansByProject } = await loadMediaAndFloorPlans(
    rows.map((p) => p.id),
  );

  return rows.map((row) =>
    mapProjectRow(row, mediaByProject.get(row.id), floorPlansByProject.get(row.id)),
  );
}

/** Lightweight rows for sitemap generation. */
export async function getSitemapProjects() {
  return db
    .select({
      slug: projects.slug,
      zone: projects.zone,
      updatedAt: projects.updatedAt,
    })
    .from(projects);
}

/* ---------------------------------------------------------------------- */
/* Blog                                                                     */
/* ---------------------------------------------------------------------- */

export async function getPublishedPosts(category?: string): Promise<SampleBlogPost[]> {
  const conditions = [eq(blogPosts.status, "published")];
  if (category && category !== "all") {
    conditions.push(eq(blogPosts.category, category));
  }

  const rows = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverImageUrl: blogPosts.coverImageUrl,
      category: blogPosts.category,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      readTimeMinutes: blogPosts.readTimeMinutes,
      createdAt: blogPosts.createdAt,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt));

  return rows.map((row) => mapBlogRow(row as unknown as BlogRow));
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<SampleBlogPost | null> {
  const [row] = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverImageUrl: blogPosts.coverImageUrl,
      category: blogPosts.category,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      readTimeMinutes: blogPosts.readTimeMinutes,
      createdAt: blogPosts.createdAt,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "published")))
    .limit(1);

  if (!row) return null;
  return mapBlogRow(row as unknown as BlogRow);
}

export async function getRelatedPublishedPosts(
  slug: string,
  limit = 3,
): Promise<SampleBlogPost[]> {
  const rows = await db
    .select({
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverImageUrl: blogPosts.coverImageUrl,
      category: blogPosts.category,
      tags: blogPosts.tags,
      publishedAt: blogPosts.publishedAt,
      readTimeMinutes: blogPosts.readTimeMinutes,
      createdAt: blogPosts.createdAt,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(and(eq(blogPosts.status, "published"), ne(blogPosts.slug, slug)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);

  return rows.map((row) => mapBlogRow(row as unknown as BlogRow));
}

/** Lightweight rows for sitemap generation. */
export async function getSitemapPosts() {
  return db
    .select({
      slug: blogPosts.slug,
      publishedAt: blogPosts.publishedAt,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"));
}

/** Distinct published categories — used for blog filters when reading from DB. */
export async function getPublishedBlogCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: blogPosts.category })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"));

  return rows.map((r) => r.category).filter((c): c is string => Boolean(c));
}

/** `{ value, label }` options (with a leading "All") for blog category filters. */
export async function getBlogCategoryOptions(): Promise<
  { value: string; label: string }[]
> {
  const categories = await getPublishedBlogCategories();
  return [
    { value: "all", label: "All" },
    ...categories.map((category) => ({
      value: category,
      label: categoryLabelFor(category),
    })),
  ];
}
