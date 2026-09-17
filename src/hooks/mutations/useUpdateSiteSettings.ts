"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { siteSettingsKeys } from "@/hooks/keys";
import type { SiteSettings } from "@/hooks/queries/useSiteSettings";

export type UpdateSiteSettingsInput = {
  companyName?: string;
  logoUrl?: string;
  tagline?: string;
  metaDescription?: string;
  defaultOgImage?: string;
  whatsappNumber?: string;
  email?: string;
  googleReviewsPlaceId?: string;
  footerText?: string;
  copyrightText?: string;
};

type UpdateSiteSettingsResponse = {
  data?: SiteSettings;
  error?: string;
};

async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<SiteSettings> {
  const res = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as UpdateSiteSettingsResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to save site settings");
  }

  return json.data;
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: siteSettingsKeys.all });
      toast.success("Site settings saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to save site settings");
    },
  });
}
