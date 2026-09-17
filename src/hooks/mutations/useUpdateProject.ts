"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectKeys } from "@/hooks/keys";
import type { Project } from "@/hooks/queries/useProjects";
import type { ProjectUpdateInput } from "@/lib/validations/projects";

export type UpdateProjectInput = {
  id: number;
} & ProjectUpdateInput;

type ApiResponse = {
  data?: Project;
  error?: string;
};

async function updateProject({
  id,
  ...input
}: UpdateProjectInput): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update project");
  }

  return json.data;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      void queryClient.invalidateQueries({
        queryKey: projectKeys.detailById(data.id),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update project");
    },
  });
}
