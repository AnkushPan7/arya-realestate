"use client";

import { useQuery } from "@tanstack/react-query";

export type DashboardStats = {
  totalProjects: number;
  ongoingProjects: number;
  newInquiries: number;
  blogPosts: number;
};

async function fetchDashboardStats(): Promise<DashboardStats> {
  // Placeholder until dedicated stats endpoint exists — hardcoded for Prompt 14
  return {
    totalProjects: 12,
    ongoingProjects: 5,
    newInquiries: 8,
    blogPosts: 4,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
    staleTime: 0,
  });
}
