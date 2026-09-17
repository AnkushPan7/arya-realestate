"use client";

import { useParams } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { useProject } from "@/hooks/queries/useProjects";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function AdminEditProjectPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: project, isLoading, isError, error, refetch } = useProject(id);

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-surface" />
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Edit Project
          </h1>
        </div>
        <AdminErrorState
          message={error?.message ?? "Project not found"}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-text-muted">{project.title}</p>
      </div>

      <ProjectForm mode="edit" initialData={project} />
    </div>
  );
}
