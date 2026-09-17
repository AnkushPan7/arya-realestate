"use client";

import { useQuery } from "@tanstack/react-query";
import { heroSlideKeys } from "@/hooks/keys";

export type HeroSlide = {
  id: number;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type HeroSlidesResponse = {
  data?: HeroSlide[];
  error?: string;
};

async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const res = await fetch("/api/hero-slides");
  const json = (await res.json()) as HeroSlidesResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load hero slides");
  }

  return json.data;
}

export function useHeroSlides() {
  return useQuery({
    queryKey: heroSlideKeys.list(),
    queryFn: fetchHeroSlides,
    staleTime: 0,
  });
}
