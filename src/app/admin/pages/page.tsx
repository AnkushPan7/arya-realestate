"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { usePagesContent } from "@/hooks/queries/usePagesContent";
import { useUpsertPageContent } from "@/hooks/mutations/useUpsertPageContent";
import type { PageContent } from "@/hooks/queries/usePagesContent";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { SkeletonCard } from "@/components/ui/Skeleton";

type PageFormState = {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
};

function pageToForm(page: PageContent): PageFormState {
  return {
    title: page.title ?? "",
    content: page.content ?? "",
    metaTitle: page.metaTitle ?? "",
    metaDescription: page.metaDescription ?? "",
  };
}

const EMPTY_FORM: PageFormState = {
  title: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
};

export default function AdminPagesPage() {
  const { data: pages, isLoading, isError, error, refetch } = usePagesContent();
  const upsertPage = useUpsertPageContent();

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [forms, setForms] = useState<Record<string, PageFormState>>({});
  const [newPageKey, setNewPageKey] = useState<string | null>(null);
  const [newPageForm, setNewPageForm] = useState<PageFormState>(EMPTY_FORM);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function toggleExpanded(pageKey: string) {
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else {
        next.add(pageKey);
      }
      return next;
    });
  }

  function updateFormField(
    pageKey: string,
    field: keyof PageFormState,
    value: string,
  ) {
    setForms((current) => ({
      ...current,
      [pageKey]: {
        ...(current[pageKey] ?? EMPTY_FORM),
        [field]: value,
      },
    }));
  }

  function handleSave(pageKey: string) {
    const page = pages?.find((item) => item.pageKey === pageKey);
    const form = forms[pageKey] ?? (page ? pageToForm(page) : undefined);
    if (!form) return;

    setSavingKey(pageKey);
    upsertPage.mutate(
      {
        pageKey,
        title: form.title.trim() || null,
        content: form.content.trim() || null,
        metaTitle: form.metaTitle.trim() || null,
        metaDescription: form.metaDescription.trim() || null,
      },
      {
        onSettled: () => setSavingKey(null),
      },
    );
  }

  function handleAddNewPage() {
    const key = window.prompt("Enter a unique page key (e.g. about, privacy):");
    if (!key) return;

    const pageKey = key.trim().toLowerCase().replace(/\s+/g, "-");
    if (!pageKey) {
      toast.error("Page key is required");
      return;
    }

    if (pages?.some((page) => page.pageKey === pageKey)) {
      toast.error("A page with this key already exists");
      return;
    }

    setNewPageKey(pageKey);
    setNewPageForm(EMPTY_FORM);
    setExpandedKeys((current) => new Set(current).add(pageKey));
  }

  function handleSaveNewPage() {
    if (!newPageKey) return;

    setSavingKey(newPageKey);
    upsertPage.mutate(
      {
        pageKey: newPageKey,
        title: newPageForm.title.trim() || null,
        content: newPageForm.content.trim() || null,
        metaTitle: newPageForm.metaTitle.trim() || null,
        metaDescription: newPageForm.metaDescription.trim() || null,
      },
      {
        onSuccess: () => {
          setNewPageKey(null);
          setNewPageForm(EMPTY_FORM);
        },
        onSettled: () => setSavingKey(null),
      },
    );
  }

  const allPages = [
    ...(pages ?? []),
    ...(newPageKey && !pages?.some((p) => p.pageKey === newPageKey)
      ? [
          {
            id: -1,
            pageKey: newPageKey,
            title: null,
            content: null,
            metaTitle: null,
            metaDescription: null,
            updatedAt: new Date().toISOString(),
          } satisfies PageContent,
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Pages
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Edit static page content and SEO metadata
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNewPage}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          Add New Page
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} className="h-20" />
            ))}
          </div>
        ) : isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : !allPages.length ? (
          <AdminEmptyState
            icon={BookOpen}
            title="No pages yet"
            description="Add a page block to manage static content."
            actionLabel="Add New Page"
            onAction={handleAddNewPage}
          />
        ) : (
          allPages.map((page) => {
            const isExpanded = expandedKeys.has(page.pageKey);
            const isNew = page.id === -1;
            const form = isNew
              ? newPageForm
              : (forms[page.pageKey] ?? pageToForm(page));
            const isSaving = savingKey === page.pageKey && upsertPage.isPending;

            return (
              <article
                key={page.pageKey}
                className="overflow-hidden rounded-2xl bg-card shadow-card"
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(page.pageKey)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface/50"
                >
                  <div className="min-w-0">
                    <h2 className="font-heading text-lg font-semibold text-primary">
                      {form.title || page.pageKey}
                    </h2>
                    <p className="mt-0.5 font-mono text-xs text-text-muted">
                      {page.pageKey}
                      {isNew ? " (new)" : null}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-text-muted transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded ? (
                  <div className="space-y-4 border-t border-border-light px-5 py-5">
                    <div>
                      <label
                        htmlFor={`title-${page.pageKey}`}
                        className="block text-sm font-medium text-primary"
                      >
                        Title
                      </label>
                      <input
                        id={`title-${page.pageKey}`}
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                          isNew
                            ? setNewPageForm((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            : updateFormField(
                                page.pageKey,
                                "title",
                                event.target.value,
                              )
                        }
                        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`content-${page.pageKey}`}
                        className="block text-sm font-medium text-primary"
                      >
                        Content
                      </label>
                      <textarea
                        id={`content-${page.pageKey}`}
                        rows={6}
                        value={form.content}
                        onChange={(event) =>
                          isNew
                            ? setNewPageForm((current) => ({
                                ...current,
                                content: event.target.value,
                              }))
                            : updateFormField(
                                page.pageKey,
                                "content",
                                event.target.value,
                              )
                        }
                        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`metaTitle-${page.pageKey}`}
                        className="block text-sm font-medium text-primary"
                      >
                        Meta Title
                      </label>
                      <input
                        id={`metaTitle-${page.pageKey}`}
                        type="text"
                        value={form.metaTitle}
                        onChange={(event) =>
                          isNew
                            ? setNewPageForm((current) => ({
                                ...current,
                                metaTitle: event.target.value,
                              }))
                            : updateFormField(
                                page.pageKey,
                                "metaTitle",
                                event.target.value,
                              )
                        }
                        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`metaDescription-${page.pageKey}`}
                        className="block text-sm font-medium text-primary"
                      >
                        Meta Description
                      </label>
                      <textarea
                        id={`metaDescription-${page.pageKey}`}
                        rows={2}
                        value={form.metaDescription}
                        onChange={(event) =>
                          isNew
                            ? setNewPageForm((current) => ({
                                ...current,
                                metaDescription: event.target.value,
                              }))
                            : updateFormField(
                                page.pageKey,
                                "metaDescription",
                                event.target.value,
                              )
                        }
                        className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                          isNew ? handleSaveNewPage() : handleSave(page.pageKey)
                        }
                        className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
                      >
                        {isSaving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
