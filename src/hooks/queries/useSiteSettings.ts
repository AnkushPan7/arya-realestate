"use client";

import { useQuery } from "@tanstack/react-query";
import { siteSettingsKeys } from "@/hooks/keys";

export type SiteSettings = {
  id: number;
  companyName: string;
  logoUrl: string | null;
  tagline: string | null;
  metaDescription: string | null;
  defaultOgImage: string | null;
  whatsappNumber: string | null;
  email: string | null;
  googleReviewsPlaceId: string | null;
  footerText: string | null;
  copyrightText: string | null;
  updatedAt: string;
};

type SiteSettingsResponse = {
  data?: SiteSettings | null;
  error?: string;
};

async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const res = await fetch("/api/site-settings");
  const json = (await res.json()) as SiteSettingsResponse;

  if (!res.ok) {
    throw new Error(json.error ?? "Unable to load site settings");
  }

  return json.data ?? null;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: siteSettingsKeys.all,
    queryFn: fetchSiteSettings,
    staleTime: 0,
  });
}
