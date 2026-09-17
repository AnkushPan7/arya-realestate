import { eq } from "drizzle-orm";
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

const idSchema = z.coerce.number().int().positive();

const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const updateBlogPostSchema = z.object({
  title: z.string().trim().min(1).optional(),
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function fetchPostById(id: number) {
  const [post] = await db
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
    .where(eq(blogPosts.id, id))
    .limit(1);

  return post ?? null;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid blog post ID", 400);
  }

  try {
    const post = await fetchPostById(parsedId.data);

    if (!post) {
      return jsonError("Blog post not found", 404);
    }

    return jsonData(post);
  } catch {
    return jsonError("Unable to load blog post", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid blog post ID", 400);
  }

  try {
    const [existing] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, parsedId.data))
      .limit(1);

    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    const body: unknown = await request.json();
    const parsed = updateBlogPostSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const updates: Partial<typeof blogPosts.$inferInsert> = {
      updatedAt: new Date(),
    };

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

    if (title !== undefined) updates.title = title;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) {
      updates.content = content;
      updates.readTimeMinutes = estimateReadTime(content ?? "");
    }
    if (coverImageUrl !== undefined) updates.coverImageUrl = coverImageUrl;
    if (category !== undefined) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (metaTitle !== undefined) updates.metaTitle = metaTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;
    if (ogImageUrl !== undefined) updates.ogImageUrl = ogImageUrl;

    if (slugInput !== undefined) {
      updates.slug = await uniqueBlogSlug(slugInput, parsedId.data);
    } else if (title !== undefined && title !== existing.title) {
      updates.slug = await uniqueBlogSlug(slugify(title), parsedId.data);
    }

    if (status !== undefined) {
      updates.status = status;
      if (
        status === "published" &&
        !existing.publishedAt &&
        publishedAt === undefined
      ) {
        updates.publishedAt = new Date();
      }
    }

    if (publishedAt !== undefined) {
      updates.publishedAt = publishedAt;
    }

    const [post] = await db
      .update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, parsedId.data))
      .returning();

    if (!post) {
      return jsonError("Blog post not found", 404);
    }

    const enriched = await fetchPostById(post.id);
    return jsonData(enriched ?? post);
  } catch {
    return jsonError("Unable to update blog post", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  const { id: idParam } = await context.params;
  const parsedId = idSchema.safeParse(idParam);

  if (!parsedId.success) {
    return jsonError("Invalid blog post ID", 400);
  }

  try {
    const [post] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, parsedId.data))
      .returning({ id: blogPosts.id });

    if (!post) {
      return jsonError("Blog post not found", 404);
    }

    return jsonData({ id: post.id });
  } catch {
    return jsonError("Unable to delete blog post", 500);
  }
}
