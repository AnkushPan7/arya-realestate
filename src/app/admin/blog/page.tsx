"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useBlogPosts } from "@/hooks/queries/useBlogPosts";
import { useDeleteBlogPost } from "@/hooks/mutations/useDeleteBlogPost";
import type { BlogPost, BlogStatus } from "@/hooks/queries/useBlogPosts";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonCard } from "@/components/ui/Skeleton";

const STATUS_FILTERS: { value: BlogStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function statusBadgeClass(status: BlogStatus): string {
  return status === "published"
    ? "bg-success-light text-success"
    : "bg-warning-light text-warning";
}

export default function AdminBlogPage() {
  const [statusFilter, setStatusFilter] = useState<BlogStatus | "">("");
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const { data: posts, isLoading, isError, error, refetch } = useBlogPosts({
    status: statusFilter || undefined,
  });
  const deletePost = useDeleteBlogPost();

  function handleConfirmDelete() {
    if (!deleteTarget) return;

    deletePost.mutate(
      { id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) },
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
            Blog
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Create and manage blog posts for the public site
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value || "all"}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              statusFilter === filter.value
                ? "bg-primary text-text-inverse"
                : "border border-border text-text-muted hover:border-primary hover:text-primary"
            }`}
          >
            {filter.label}
          </button>
        ))}
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
        ) : !posts?.length ? (
          <AdminEmptyState
            icon={FileText}
            title="No blog posts yet"
            description="Create your first post to populate the blog."
            actionLabel="New Post"
            actionHref="/admin/blog/new"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl bg-card shadow-card"
              >
                <div className="relative aspect-video bg-surface">
                  {post.coverImageUrl ? (
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-12 w-12 text-text-light" />
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-lg px-2 py-1 text-xs font-semibold tracking-wider ${statusBadgeClass(post.status)}`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 font-heading text-lg font-semibold text-primary">
                        {post.title}
                      </h2>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm text-text-muted">
                          {post.excerpt}
                        </p>
                      ) : null}
                      {post.authorName ? (
                        <p className="mt-2 text-xs text-text-light">
                          By {post.authorName}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="rounded-lg p-2 text-text-muted hover:bg-accent-subtle hover:text-accent"
                        aria-label="Edit post"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        className="rounded-lg p-2 text-text-muted hover:bg-error-light hover:text-error"
                        aria-label="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete blog post?"
        message="This post will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        loading={deletePost.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
