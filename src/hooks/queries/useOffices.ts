"use client";

import { useQuery } from "@tanstack/react-query";
import { officeKeys } from "@/hooks/keys";
import type { SocialPlatform } from "@/lib/validations/offices";

export type OfficeSocialLink = {
  id: number;
  officeId: number | null;
  platform: SocialPlatform;
  url: string;
  displayOrder: number;
  isActive: boolean;
};

export type Office = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  phoneNumbers: string[] | null;
  email: string | null;
  googleMapsUrl: string | null;
  googleMapsEmbedUrl: string | null;
  latitude: string | null;
  longitude: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  socialLinks: OfficeSocialLink[];
};

type OfficesResponse = {
  data?: Office[];
  error?: string;
};

async function fetchOffices(): Promise<Office[]> {
  const res = await fetch("/api/offices");
  const json = (await res.json()) as OfficesResponse;

  if (!res.ok) {
    throw new Error(json.error ?? "Unable to load offices");
  }

  return json.data ?? [];
}

export function useOffices() {
  return useQuery({
    queryKey: officeKeys.list(),
    queryFn: fetchOffices,
    staleTime: 0,
  });
}
