"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useOffices, type Office } from "@/hooks/queries/useOffices";
import { useCreateOffice } from "@/hooks/mutations/useCreateOffice";
import { useUpdateOffice } from "@/hooks/mutations/useUpdateOffice";
import { useDeleteOffice } from "@/hooks/mutations/useDeleteOffice";
import { OfficeModal } from "@/components/admin/OfficeModal";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";
import type { OfficeInput } from "@/lib/validations/offices";

export default function AdminOfficesPage() {
  const { data: offices, isLoading, isError, error, refetch } = useOffices();
  const createOffice = useCreateOffice();
  const updateOffice = useUpdateOffice();
  const deleteOffice = useDeleteOffice();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Office | null>(null);

  const isSaving = createOffice.isPending || updateOffice.isPending;

  function openCreate() {
    setEditingOffice(null);
    setModalOpen(true);
  }

  function openEdit(office: Office) {
    setEditingOffice(office);
    setModalOpen(true);
  }

  function closeModal() {
    if (isSaving) return;
    setModalOpen(false);
    setEditingOffice(null);
  }

  function handleSubmit(data: OfficeInput) {
    if (editingOffice) {
      updateOffice.mutate(
        { id: editingOffice.id, data },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
      return;
    }

    createOffice.mutate(data, {
      onSuccess: () => {
        closeModal();
      },
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    deleteOffice.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Offices
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage office locations, contact numbers, and social links
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          Add Office
        </button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} className="h-56" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : null}

        {!isLoading && !isError && offices?.length === 0 ? (
          <AdminEmptyState
            icon={MapPin}
            title="No offices yet"
            description="Add your first office location to show on the contact page."
            actionLabel="Add Office"
            onAction={openCreate}
          />
        ) : null}

        {!isLoading && !isError && offices && offices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {offices.map((office) => (
              <article
                key={office.id}
                className="rounded-xl bg-card p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-primary">
                      {office.name}
                    </h2>
                    {!office.isActive ? (
                      <span className="mt-1 inline-block rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium text-warning">
                        Inactive
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(office)}
                      className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface hover:text-primary"
                      aria-label={`Edit ${office.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(office)}
                      className="rounded-lg border border-border p-2 text-text-muted hover:bg-error-light hover:text-error"
                      aria-label={`Delete ${office.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-text-muted">{office.address}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {office.city}, {office.state}
                  {office.pincode ? ` ${office.pincode}` : ""}
                </p>

                {office.phoneNumbers && office.phoneNumbers.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm text-text">
                    {office.phoneNumbers.map((phone) => (
                      <li key={phone}>{phone}</li>
                    ))}
                  </ul>
                ) : null}

                {office.email ? (
                  <p className="mt-2 text-sm text-text">{office.email}</p>
                ) : null}

                {office.socialLinks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {office.socialLinks.map((link) => (
                      <span
                        key={`${link.platform}-${link.url}`}
                        className="rounded-full bg-accent-subtle px-2.5 py-1 text-xs font-medium capitalize text-accent"
                      >
                        {link.platform}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <OfficeModal
        isOpen={modalOpen}
        office={editingOffice}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={isSaving}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete office?"
        message={
          deleteTarget
            ? `This will permanently remove ${deleteTarget.name} and its social links.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteOffice.isPending}
      />
    </div>
  );
}
