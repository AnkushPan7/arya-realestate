"use client";

import { useQuery } from "@tanstack/react-query";
import { teamKeys } from "@/hooks/keys";

export type TeamMember = {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type TeamMembersResponse = {
  data?: TeamMember[];
  error?: string;
};

async function fetchTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch("/api/team");
  const json = (await res.json()) as TeamMembersResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load team members");
  }

  return json.data;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: fetchTeamMembers,
    staleTime: 0,
  });
}
