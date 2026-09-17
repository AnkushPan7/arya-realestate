"use client";

import { useQuery } from "@tanstack/react-query";
import { blogKeys } from "@/hooks/keys";
import type { BlogPost } from "@/hooks/queries/useBlogPosts";

type BlogPostResponse = {
  data?: BlogPost;
  error?: string;
};

async function fetchBlogPost(id: number): Promise<BlogPost> {
  const res = await fetch(`/api/blog/${id}`);
  const json = (await res.json()) as BlogPostResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load blog post");
  }

  return json.data;
}

export function useBlogPost(id: number) {
  return useQuery({
    queryKey: blogKeys.detailById(id),
    queryFn: () => fetchBlogPost(id),
    staleTime: 0,
    enabled: Number.isFinite(id) && id > 0,
  });
}
