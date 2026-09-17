"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamKeys } from "@/hooks/keys";
import type { TeamMember } from "@/hooks/queries/useTeamMembers";

export type CreateTeamMemberInput = {
  name: string;
  role: string;
  bio?: string | null;
  photoUrl?: string | null;
  displayOrder?: number;
  isActive?: boolean;
};

type ApiResponse = {
  data?: TeamMember;
  error?: string;
};

async function createTeamMember(
  input: CreateTeamMemberInput,
): Promise<TeamMember> {
  const res = await fetch("/api/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to create team member");
  }

  return json.data;
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
      toast.success("Team member created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create team member");
    },
  });
}
