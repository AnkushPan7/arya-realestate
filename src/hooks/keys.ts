/**
 * Centralized query key factory.
 * Every TanStack Query hook uses keys from here.
 * Prevents cache key drift across components.
 */

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (slug: string) => [...projectKeys.details(), "slug", slug] as const,
  detailById: (id: number) => [...projectKeys.details(), "id", id] as const,
};

export const officeKeys = {
  all: ["offices"] as const,
  list: () => [...officeKeys.all, "list"] as const,
  detail: (id: number) => [...officeKeys.all, "detail", id] as const,
};

export const heroSlideKeys = {
  all: ["heroSlides"] as const,
  list: () => [...heroSlideKeys.all, "list"] as const,
  detail: (id: number) => [...heroSlideKeys.all, "detail", id] as const,
};

export const siteSettingsKeys = {
  all: ["siteSettings"] as const,
};

export const inquiryKeys = {
  all: ["inquiries"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...inquiryKeys.all, "list", filters] as const,
  newCount: () => [...inquiryKeys.all, "newCount"] as const,
};

export const blogKeys = {
  all: ["blog"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...blogKeys.lists(), filters] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (slug: string) => [...blogKeys.details(), "slug", slug] as const,
  detailById: (id: number) => [...blogKeys.details(), "id", id] as const,
};

export const teamKeys = {
  all: ["team"] as const,
  list: () => [...teamKeys.all, "list"] as const,
  detail: (id: number) => [...teamKeys.all, "detail", id] as const,
};

export const pagesContentKeys = {
  all: ["pagesContent"] as const,
  list: () => [...pagesContentKeys.all, "list"] as const,
  detail: (key: string) => [...pagesContentKeys.all, key] as const,
};

export const googleReviewKeys = {
  all: ["googleReviews"] as const,
};
