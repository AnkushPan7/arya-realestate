"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useHeroSlides } from "@/hooks/queries/useHeroSlides";
import { useCreateHeroSlide } from "@/hooks/mutations/useCreateHeroSlide";
import { useUpdateHeroSlide } from "@/hooks/mutations/useUpdateHeroSlide";
import { useDeleteHeroSlide } from "@/hooks/mutations/useDeleteHeroSlide";
import type { HeroSlide } from "@/hooks/queries/useHeroSlides";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";

type SlideFormState = {
  imageUrl: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
};

const EMPTY_FORM: SlideFormState = {
  imageUrl: "",
  title: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
};

export default function AdminHeroSlidesPage() {
  const { data: slides, isLoading, isError, error, refetch } = useHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SlideFormState>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  function openModal() {
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
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

      setForm((current) => ({ ...current, imageUrl: json.data!.url }));
      toast.success("Image uploaded");
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

    if (!form.imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    createSlide.mutate(
      {
        imageUrl: form.imageUrl.trim(),
        title: form.title.trim() || null,
        subtitle: form.subtitle.trim() || null,
        ctaText: form.ctaText.trim() || null,
        ctaLink: form.ctaLink.trim() || null,
        isActive: form.isActive,
      },
      {
        onSuccess: () => {
          closeModal();
        },
      },
    );
  }

  function handleToggleActive(slide: HeroSlide) {
    updateSlide.mutate({
      id: slide.id,
      isActive: !slide.isActive,
    });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    deleteSlide.mutate(
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
            Hero Slides
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage homepage carousel slides
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} className="h-72" />
            ))}
          </div>
        ) : isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : !slides?.length ? (
          <AdminEmptyState
            icon={ImageIcon}
            title="No hero slides yet"
            description="Add your first slide to populate the homepage carousel."
            actionLabel="Add Slide"
            onAction={openModal}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide) => (
              <article
                key={slide.id}
                className="overflow-hidden rounded-2xl bg-card shadow-card"
              >
                <div className="relative aspect-video bg-surface">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title ?? "Hero slide"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  {!slide.isActive ? (
                    <span className="absolute left-3 top-3 rounded-lg bg-primary/80 px-2 py-1 text-xs font-semibold tracking-wider text-text-inverse">
                      Inactive
                    </span>
                  ) : null}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-heading text-lg font-semibold text-primary">
                        {slide.title || "Untitled slide"}
                      </h2>
                      {slide.subtitle ? (
                        <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                          {slide.subtitle}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(slide)}
                      className="rounded-lg p-2 text-text-muted hover:bg-error-light hover:text-error"
                      aria-label="Delete slide"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {slide.ctaText ? (
                    <p className="mt-3 text-xs text-text-light">
                      CTA: {slide.ctaText}
                      {slide.ctaLink ? ` → ${slide.ctaLink}` : ""}
                    </p>
                  ) : null}

                  <div className="mt-4 flex items-center justify-between border-t border-border-light pt-4">
                    <span className="text-sm text-text-muted">Active</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={slide.isActive}
                      disabled={updateSlide.isPending}
                      onClick={() => handleToggleActive(slide)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        slide.isActive ? "bg-accent" : "bg-border"
                      } disabled:opacity-70`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          slide.isActive ? "translate-x-5" : "translate-x-0"
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
            aria-labelledby="add-slide-title"
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-elevated"
          >
            <h2
              id="add-slide-title"
              className="font-heading text-xl font-bold text-primary"
            >
              Add Slide
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Upload an image or paste a URL, then add optional copy and CTA.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-sm font-medium text-primary"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
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
                  {uploading ? "Uploading…" : "Upload Image"}
                </button>
              </div>

              {form.imageUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
                  <Image
                    src={form.imageUrl}
                    alt="Slide preview"
                    fill
                    className="object-cover"
                    sizes="512px"
                  />
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-primary"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="subtitle"
                  className="block text-sm font-medium text-primary"
                >
                  Subtitle
                </label>
                <input
                  id="subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subtitle: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="ctaText"
                  className="block text-sm font-medium text-primary"
                >
                  CTA Text
                </label>
                <input
                  id="ctaText"
                  type="text"
                  value={form.ctaText}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ctaText: event.target.value,
                    }))
                  }
                  className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="ctaLink"
                  className="block text-sm font-medium text-primary"
                >
                  CTA Link
                </label>
                <input
                  id="ctaLink"
                  type="text"
                  value={form.ctaLink}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ctaLink: event.target.value,
                    }))
                  }
                  placeholder="/projects or https://..."
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
                  disabled={createSlide.isPending}
                  className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSlide.isPending || uploading}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
                >
                  {createSlide.isPending ? "Saving…" : "Add Slide"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete hero slide?"
        message="This slide will be removed from the homepage carousel. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteSlide.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
