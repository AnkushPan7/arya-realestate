"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamKeys } from "@/hooks/keys";

type DeleteTeamMemberInput = {
  id: number;
};

type ApiResponse = {
  data?: { id: number };
  error?: string;
};

async function deleteTeamMember({
  id,
}: DeleteTeamMemberInput): Promise<{ id: number }> {
  const res = await fetch(`/api/team/${id}`, {
    method: "DELETE",
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to delete team member");
  }

  return json.data;
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all });
      toast.success("Team member deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete team member");
    },
  });
}
