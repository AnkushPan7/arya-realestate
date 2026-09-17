"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { heroSlideKeys } from "@/hooks/keys";
import type { HeroSlide } from "@/hooks/queries/useHeroSlides";

export type CreateHeroSlideInput = {
  imageUrl: string;
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

async function createHeroSlide(
  input: CreateHeroSlideInput,
): Promise<HeroSlide> {
  const res = await fetch("/api/hero-slides", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to create hero slide");
  }

  return json.data;
}

export function useCreateHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHeroSlide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
      toast.success("Hero slide created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create hero slide");
    },
  });
}
