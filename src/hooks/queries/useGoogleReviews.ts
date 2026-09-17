"use client";

import { useQuery } from "@tanstack/react-query";
import { googleReviewKeys } from "@/hooks/keys";
import type { GoogleReview } from "@/app/api/google-reviews/route";

type GoogleReviewsResponse = {
  data?: GoogleReview[];
  error?: string;
};

async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  const res = await fetch("/api/google-reviews");
  const json = (await res.json()) as GoogleReviewsResponse;

  if (!res.ok) {
    throw new Error(json.error ?? "Unable to load Google reviews");
  }

  return json.data ?? [];
}

export function useGoogleReviews() {
  return useQuery({
    queryKey: googleReviewKeys.all,
    queryFn: fetchGoogleReviews,
    staleTime: 5 * 60 * 1000,
  });
}

export type { GoogleReview };
