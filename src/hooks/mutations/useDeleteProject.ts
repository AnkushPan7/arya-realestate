"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectKeys } from "@/hooks/keys";

type DeleteProjectInput = {
  id: number;
};

type ApiResponse = {
  data?: { id: number };
  error?: string;
};

async function deleteProject({
  id,
}: DeleteProjectInput): Promise<{ id: number }> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to delete project");
  }

  return json.data;
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete project");
    },
  });
}
