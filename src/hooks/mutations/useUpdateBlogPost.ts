"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blogKeys } from "@/hooks/keys";
import type {
  BlogPost,
  BlogStatus,
} from "@/hooks/queries/useBlogPosts";

export type UpdateBlogPostInput = {
  id: number;
  title?: string;
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

async function updateBlogPost({
  id,
  ...input
}: UpdateBlogPostInput): Promise<BlogPost> {
  const res = await fetch(`/api/blog/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update blog post");
  }

  return json.data;
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBlogPost,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
      void queryClient.invalidateQueries({
        queryKey: blogKeys.detailById(data.id),
      });
      toast.success("Blog post updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update blog post");
    },
  });
}
