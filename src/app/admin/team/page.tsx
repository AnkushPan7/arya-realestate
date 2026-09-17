"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Pencil, Plus, Trash2, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useTeamMembers } from "@/hooks/queries/useTeamMembers";
import { useCreateTeamMember } from "@/hooks/mutations/useCreateTeamMember";
import { useUpdateTeamMember } from "@/hooks/mutations/useUpdateTeamMember";
import { useDeleteTeamMember } from "@/hooks/mutations/useDeleteTeamMember";
import type { TeamMember } from "@/hooks/queries/useTeamMembers";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";

type MemberFormState = {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY_FORM: MemberFormState = {
  name: "",
  role: "",
  bio: "",
  photoUrl: "",
  displayOrder: "",
  isActive: true,
};

function memberToForm(member: TeamMember): MemberFormState {
  return {
    name: member.name,
    role: member.role,
    bio: member.bio ?? "",
    photoUrl: member.photoUrl ?? "",
    displayOrder: String(member.displayOrder),
    isActive: member.isActive,
  };
}

export default function AdminTeamPage() {
  const { data: members, isLoading, isError, error, refetch } = useTeamMembers();
  const createMember = useCreateTeamMember();
  const updateMember = useUpdateTeamMember();
  const deleteMember = useDeleteTeamMember();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<MemberFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const isEditing = editingMember !== null;
  const isSaving = createMember.isPending || updateMember.isPending;

  function openCreateModal() {
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(member: TeamMember) {
    setEditingMember(member);
    setForm(memberToForm(member));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingMember(null);
    setForm(EMPTY_FORM);
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json()) as {
        data?: { url: string; path: string };
        error?: string;
      };

      if (!res.ok || !json.data) {
        throw new Error(json.error ?? "Unable to upload image");
      }

      setForm((current) => ({ ...current, photoUrl: json.data!.url }));
      toast.success("Photo uploaded");
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload image",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.role.trim()) {
      toast.error("Name and role are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      bio: form.bio.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      displayOrder: form.displayOrder.trim()
        ? Number.parseInt(form.displayOrder, 10)
        : undefined,
      isActive: form.isActive,
    };

    if (isEditing && editingMember) {
      updateMember.mutate(
        { id: editingMember.id, ...payload },
        { onSuccess: () => closeModal() },
      );
    } else {
      createMember.mutate(payload, { onSuccess: () => closeModal() });
    }
  }

  function handleToggleActive(member: TeamMember) {
    updateMember.mutate({
      id: member.id,
      isActive: !member.isActive,
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    deleteMember.mutate(
      { id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Team
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage team members shown on the About page
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} className="h-80" />
            ))}
          </div>
        ) : isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : !members?.length ? (
          <AdminEmptyState
            icon={UserRound}
            title="No team members yet"
            description="Add your first team member to populate the About page."
            actionLabel="Add Member"
            onAction={openCreateModal}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-2xl bg-card shadow-card"
              >
                <div className="relative aspect-square bg-surface">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <UserRound className="h-16 w-16 text-text-light" />
                    </div>
                  )}
                  {!member.isActive ? (
                    <span className="absolute left-3 top-3 rounded-lg bg-primary/80 px-2 py-1 text-xs font-semibold tracking-wider text-text-inverse">
                      Inactive
                    </span>
                  ) : null}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-heading text-lg font-semibold text-primary">
                        {member.name}
                      </h2>
                      <p className="mt-0.5 text-sm font-medium text-accent">
                        {member.role}
                      </p>
                      {member.bio ? (
                        <p className="mt-2 line-clamp-3 text-sm text-text-muted">
                          {member.bio}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="rounded-lg p-2 text-text-muted hover:bg-accent-subtle hover:text-accent"
                        aria-label="Edit member"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(member)}
                        className="rounded-lg p-2 text-text-muted hover:bg-error-light hover:text-error"
                        aria-label="Delete member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-text-light">
                    Order: {member.displayOrder}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-border-light pt-4">
                    <span className="text-sm text-text-muted">Active</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={member.isActive}
                      disabled={updateMember.isPending}
                      onClick={() => handleToggleActive(member)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        member.isActive ? "bg-accent" : "bg-border"
                      } disabled:opacity-70`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          member.isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-modal-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-elevated"
          >
            <h2
              id="member-modal-title"
              className="font-heading text-xl font-bold text-primary"
            >
              {isEditing ? "Edit Member" : "Add Member"}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Upload a photo or paste a URL, then fill in member details.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-primary"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-primary"
                >
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  required
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-primary"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="photoUrl"
                  className="block text-sm font-medium text-primary"
                >
                  Photo URL
                </label>
                <input
                  id="photoUrl"
                  type="url"
                  value={form.photoUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      photoUrl: event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse disabled:opacity-70"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload Photo"}
                </button>
              </div>

              {form.photoUrl ? (
                <div className="relative aspect-square max-w-[200px] overflow-hidden rounded-xl bg-surface">
                  <Image
                    src={form.photoUrl}
                    alt="Photo preview"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="displayOrder"
                  className="block text-sm font-medium text-primary"
                >
                  Display Order
                </label>
                <input
                  id="displayOrder"
                  type="number"
                  min={0}
                  value={form.displayOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      displayOrder: event.target.value,
                    }))
                  }
                  placeholder="Auto-assigned if empty"
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm font-medium text-primary">
                  Is Active
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploading}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
                >
                  {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete team member?"
        message="This member will be removed from the About page. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteMember.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
