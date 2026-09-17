"use client";

import { ProjectForm } from "@/components/admin/ProjectForm";

export default function AdminNewProjectPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          New Project
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Create a new property listing
        </p>
      </div>

      <ProjectForm mode="create" />
    </div>
  );
}
