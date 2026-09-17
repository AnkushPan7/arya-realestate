import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { slugify } from "@/lib/utils";

/** Return a unique blog slug, optionally excluding an existing post id on update. */
export async function uniqueBlogSlug(
  base: string,
  excludeId?: number,
): Promise<string> {
  const normalized = slugify(base) || "post";
  let candidate = normalized;
  let suffix = 0;

  while (true) {
    const conditions = [eq(blogPosts.slug, candidate)];
    if (excludeId !== undefined) {
      conditions.push(ne(blogPosts.id, excludeId));
    }

    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(and(...conditions))
      .limit(1);

    if (!existing) return candidate;
    suffix += 1;
    candidate = `${normalized}-${suffix}`;
  }
}
