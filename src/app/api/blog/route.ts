import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blogPosts, users } from "@/db/schema";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
  validationError,
} from "@/lib/api";
import { uniqueBlogSlug } from "@/lib/blog";
import { estimateReadTime, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const createBlogPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .preprocess(emptyToNull, z.string().trim().min(1).optional())
    .optional(),
  excerpt: z
    .preprocess(emptyToNull, z.string().trim().nullable().optional())
    .optional(),
  content: z
    .preprocess(emptyToNull, z.string().trim().nullable().optional())
    .optional(),
  coverImageUrl: z
    .preprocess(emptyToNull, z.string().trim().url().nullable().optional())
    .optional(),
  category: z
    .preprocess(emptyToNull, z.string().trim().nullable().optional())
    .optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  status: z.enum(["draft", "published"]).optional(),
  publishedAt: z
    .preprocess(
      (value) => (value === null || value === "" ? null : value),
      z.coerce.date().nullable().optional(),
    )
    .optional(),
  metaTitle: z
    .preprocess(emptyToNull, z.string().trim().nullable().optional())
    .optional(),
  metaDescription: z
    .preprocess(emptyToNull, z.string().trim().nullable().optional())
    .optional(),
  ogImageUrl: z
    .preprocess(emptyToNull, z.string().trim().url().nullable().optional())
    .optional(),
});

const listBlogPostsSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
});

export async function GET(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = listBlogPostsSchema.safeParse({
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { status } = parsed.data;

    const rows = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImageUrl: blogPosts.coverImageUrl,
        authorId: blogPosts.authorId,
        authorName: users.name,
        category: blogPosts.category,
        tags: blogPosts.tags,
        status: blogPosts.status,
        publishedAt: blogPosts.publishedAt,
        readTimeMinutes: blogPosts.readTimeMinutes,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        ogImageUrl: blogPosts.ogImageUrl,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(status ? eq(blogPosts.status, status) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    return jsonData(rows);
  } catch {
    return jsonError("Unable to load blog posts", 500);
  }
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body: unknown = await request.json();
    const parsed = createBlogPostSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const {
      title,
      slug: slugInput,
      excerpt,
      content,
      coverImageUrl,
      category,
      tags,
      status,
      publishedAt,
      metaTitle,
      metaDescription,
      ogImageUrl,
    } = parsed.data;

    const postStatus = status ?? "draft";
    const slug = await uniqueBlogSlug(slugInput ?? slugify(title));
    const readTimeMinutes = estimateReadTime(content ?? "");

    let resolvedPublishedAt: Date | null = publishedAt ?? null;
    if (postStatus === "published" && !resolvedPublishedAt) {
      resolvedPublishedAt = new Date();
    }

    const [post] = await db
      .insert(blogPosts)
      .values({
        title,
        slug,
        excerpt: excerpt ?? null,
        content: content ?? null,
        coverImageUrl: coverImageUrl ?? null,
        authorId: auth.id,
        category: category ?? null,
        tags: tags ?? [],
        status: postStatus,
        publishedAt: resolvedPublishedAt,
        readTimeMinutes,
        metaTitle: metaTitle ?? null,
        metaDescription: metaDescription ?? null,
        ogImageUrl: ogImageUrl ?? null,
      })
      .returning();

    return jsonData(post, 201);
  } catch {
    return jsonError("Unable to create blog post", 500);
  }
}
