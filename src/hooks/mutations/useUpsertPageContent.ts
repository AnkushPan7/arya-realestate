"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pagesContentKeys } from "@/hooks/keys";
import type { PageContent } from "@/hooks/queries/usePagesContent";

export type UpsertPageContentInput = {
  pageKey: string;
  title?: string | null;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type ApiResponse = {
  data?: PageContent;
  error?: string;
};

async function upsertPageContent(
  input: UpsertPageContentInput,
): Promise<PageContent> {
  const res = await fetch("/api/pages-content", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to save page content");
  }

  return json.data;
}

export function useUpsertPageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertPageContent,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pagesContentKeys.all });
      toast.success("Page content saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save page content");
    },
  });
}
