"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamKeys } from "@/hooks/keys";
import type { TeamMember } from "@/hooks/queries/useTeamMembers";

export type UpdateTeamMemberInput = {
  id: number;
  name?: string;
  role?: string;
  bio?: string | null;
  photoUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

type ApiResponse = {
  data?: TeamMember;
  error?: string;
};

async function updateTeamMember({
  id,
  ...input
}: UpdateTeamMemberInput): Promise<TeamMember> {
  const res = await fetch(`/api/team/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update team member");
  }

  return json.data;
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
      toast.success("Team member updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update team member");
    },
  });
}
