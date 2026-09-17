"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blogKeys } from "@/hooks/keys";
import type {
  BlogPost,
  BlogStatus,
} from "@/hooks/queries/useBlogPosts";

export type CreateBlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  category?: string | null;
  tags?: string[];
  status?: BlogStatus;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
};

type ApiResponse = {
  data?: BlogPost;
  error?: string;
};

async function createBlogPost(
  input: CreateBlogPostInput,
): Promise<BlogPost> {
  const res = await fetch("/api/blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to create blog post");
  }

  return json.data;
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Blog post created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create blog post");
    },
  });
}
