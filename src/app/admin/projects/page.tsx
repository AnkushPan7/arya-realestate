"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import {
  getProjectThumbnail,
  useProjects,
  type Project,
} from "@/hooks/queries/useProjects";
import { useUpdateProject } from "@/hooks/mutations/useUpdateProject";
import { useDeleteProject } from "@/hooks/mutations/useDeleteProject";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/Skeleton";

const ZONE_FILTERS = [
  { value: "", label: "All Zones" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
] as const;

const STATUS_FILTERS = [
  { value: "", label: "All Status" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
] as const;

function statusBadgeClass(status: Project["status"]): string {
  switch (status) {
    case "upcoming":
      return "bg-info-light text-info";
    case "ongoing":
      return "bg-warning-light text-warning";
    case "completed":
      return "bg-success-light text-success";
  }
}

export default function AdminProjectsPage() {
  const [zoneFilter, setZoneFilter] = useState<"" | "east" | "west">("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "upcoming" | "ongoing" | "completed"
  >("");
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filters = {
    zone: zoneFilter || undefined,
    status: statusFilter || undefined,
  };

  const { data: projects, isLoading, isError, error, refetch } =
    useProjects(filters);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  function handleToggleFeatured(project: Project) {
    updateProject.mutate({
      id: project.id,
      isFeatured: !project.isFeatured,
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    deleteProject.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          setDeleteTarget(null);
        },
      },
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Projects
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage property listings, media, and floor plans
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {ZONE_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setZoneFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              zoneFilter === filter.value
                ? "bg-accent text-white"
                : "bg-surface text-text-muted hover:text-primary"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-primary text-text-inverse"
                : "bg-surface text-text-muted hover:text-primary"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : !projects?.length ? (
          <AdminEmptyState
            icon={Building2}
            title="No projects yet"
            description="Add your first project to start managing listings."
            actionLabel="Add Project"
            actionHref="/admin/projects/new"
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-light text-text-muted">
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Zone</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const thumbnail = getProjectThumbnail(project);

                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border-light last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                            {thumbnail ? (
                              <Image
                                src={thumbnail}
                                alt={project.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-text-light">
                                <Building2 className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-primary">
                              {project.title}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {project.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-text-muted">
                        {project.zone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(project.status)}`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize text-text-muted">
                        {project.propertyType}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          disabled={updateProject.isPending}
                          className={`rounded-lg p-2 transition-colors disabled:opacity-70 ${
                            project.isFeatured
                              ? "text-accent"
                              : "text-text-light hover:text-accent"
                          }`}
                          aria-label={
                            project.isFeatured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                        >
                          <Star
                            className="h-4 w-4"
                            fill={project.isFeatured ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="rounded-lg p-2 text-text-muted hover:bg-accent-subtle hover:text-accent"
                            aria-label="Edit project"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(project)}
                            className="rounded-lg p-2 text-text-muted hover:bg-error-light hover:text-error"
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete project?"
        message="This will permanently remove the project and all associated media and floor plans."
        confirmLabel="Delete"
        loading={deleteProject.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
