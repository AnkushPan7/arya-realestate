"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { heroSlideKeys } from "@/hooks/keys";
import type { HeroSlide } from "@/hooks/queries/useHeroSlides";

export type UpdateHeroSlideInput = {
  id: number;
  imageUrl?: string;
  title?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

type ApiResponse = {
  data?: HeroSlide;
  error?: string;
};

async function updateHeroSlide({
  id,
  ...input
}: UpdateHeroSlideInput): Promise<HeroSlide> {
  const res = await fetch(`/api/hero-slides/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update hero slide");
  }

  return json.data;
}

export function useUpdateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHeroSlide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update hero slide");
    },
  });
}
