"use client";

import { useQuery } from "@tanstack/react-query";
import { projectKeys } from "@/hooks/keys";

export type ProjectMedia = {
  id: number;
  projectId: number;
  mediaType: "image" | "video";
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number;
  createdAt: string;
};

export type ProjectFloorPlan = {
  id: number;
  projectId: number;
  title: string;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  zone: "east" | "west";
  status: "upcoming" | "ongoing" | "completed";
  propertyType:
    | "apartment"
    | "bungalow"
    | "commercial"
    | "industrial"
    | "plot"
    | "land";
  bhkOptions: string[] | null;
  priceMin: string | null;
  priceMax: string | null;
  displayPrice: string | null;
  location: string;
  address: string | null;
  pincode: string | null;
  plotArea: string | null;
  areaUnit: string | null;
  description: string | null;
  features: string[] | null;
  reraNumber: string | null;
  possessionDate: string | null;
  videoUrl: string | null;
  isFeatured: boolean;
  displayOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  media?: ProjectMedia[];
  floorPlans?: ProjectFloorPlan[];
};

export type ProjectFilters = {
  zone?: "east" | "west";
  status?: "upcoming" | "ongoing" | "completed";
  propertyType?: Project["propertyType"];
  featured?: boolean;
};

type ProjectsResponse = {
  data?: Project[];
  error?: string;
};

type ProjectResponse = {
  data?: Project;
  error?: string;
};

function buildQueryString(filters?: ProjectFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();
  if (filters.zone) params.set("zone", filters.zone);
  if (filters.status) params.set("status", filters.status);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.featured) params.set("featured", "true");

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchProjects(filters?: ProjectFilters): Promise<Project[]> {
  const res = await fetch(`/api/projects${buildQueryString(filters)}`);
  const json = (await res.json()) as ProjectsResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load projects");
  }

  return json.data;
}

async function fetchProject(id: number): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`);
  const json = (await res.json()) as ProjectResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load project");
  }

  return json.data;
}

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters ?? {}),
    queryFn: () => fetchProjects(filters),
    staleTime: 0,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detailById(id),
    queryFn: () => fetchProject(id),
    enabled: Number.isFinite(id) && id > 0,
    staleTime: 0,
  });
}

export function getProjectThumbnail(project: Project): string | null {
  const media = project.media ?? [];
  const primary = media.find((item) => item.isPrimary);
  return primary?.url ?? media[0]?.url ?? null;
}
