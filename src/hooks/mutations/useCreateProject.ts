"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectKeys } from "@/hooks/keys";
import type { Project } from "@/hooks/queries/useProjects";
import type { ProjectCreateInput } from "@/lib/validations/projects";

type ApiResponse = {
  data?: Project;
  error?: string;
};

async function createProject(input: ProjectCreateInput): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to create project");
  }

  return json.data;
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success("Project created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create project");
    },
  });
}
