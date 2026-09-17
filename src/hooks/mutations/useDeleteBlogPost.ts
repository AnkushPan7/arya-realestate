"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { blogKeys } from "@/hooks/keys";

type DeleteBlogPostInput = {
  id: number;
};

type ApiResponse = {
  data?: { id: number };
  error?: string;
};

async function deleteBlogPost({
  id,
}: DeleteBlogPostInput): Promise<{ id: number }> {
  const res = await fetch(`/api/blog/${id}`, {
    method: "DELETE",
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to delete blog post");
  }

  return json.data;
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: blogKeys.all });
      toast.success("Blog post deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete blog post");
    },
  });
}
