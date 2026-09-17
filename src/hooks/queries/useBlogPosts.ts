"use client";

import { useQuery } from "@tanstack/react-query";
import { blogKeys } from "@/hooks/keys";

export type BlogStatus = "draft" | "published";

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  authorId: number | null;
  authorName: string | null;
  category: string | null;
  tags: string[] | null;
  status: BlogStatus;
  publishedAt: string | null;
  readTimeMinutes: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type BlogPostsResponse = {
  data?: BlogPost[];
  error?: string;
};

type UseBlogPostsOptions = {
  status?: BlogStatus;
};

async function fetchBlogPosts(
  options?: UseBlogPostsOptions,
): Promise<BlogPost[]> {
  const params = new URLSearchParams();
  if (options?.status) {
    params.set("status", options.status);
  }

  const query = params.toString();
  const url = query ? `/api/blog?${query}` : "/api/blog";

  const res = await fetch(url);
  const json = (await res.json()) as BlogPostsResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load blog posts");
  }

  return json.data;
}

export function useBlogPosts(options?: UseBlogPostsOptions) {
  const filters = { status: options?.status };

  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () => fetchBlogPosts(options),
    staleTime: 0,
  });
}
