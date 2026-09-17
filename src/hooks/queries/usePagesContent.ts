"use client";

import { useQuery } from "@tanstack/react-query";
import { pagesContentKeys } from "@/hooks/keys";

export type PageContent = {
  id: number;
  pageKey: string;
  title: string | null;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
};

type PagesContentResponse = {
  data?: PageContent[];
  error?: string;
};

async function fetchPagesContent(): Promise<PageContent[]> {
  const res = await fetch("/api/pages-content");
  const json = (await res.json()) as PagesContentResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load pages content");
  }

  return json.data;
}

export function usePagesContent() {
  return useQuery({
    queryKey: pagesContentKeys.list(),
    queryFn: fetchPagesContent,
    staleTime: 0,
  });
}
