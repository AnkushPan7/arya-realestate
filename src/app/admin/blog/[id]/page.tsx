"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { useBlogPost } from "@/hooks/queries/useBlogPost";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function EditBlogPostPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data: post, isLoading, isError, error, refetch } = useBlogPost(id);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div>
        <AdminErrorState message="Invalid blog post ID" />
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/blog" className="text-accent hover:underline">
            ← Back to all posts
          </Link>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
        <div className="mt-8 max-w-3xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div>
        <AdminErrorState
          message={error?.message ?? "Blog post not found"}
          onRetry={() => void refetch()}
        />
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/blog" className="text-accent hover:underline">
            ← Back to all posts
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Edit Post
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <BlogForm post={post} />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        <Link href="/admin/blog" className="text-accent hover:underline">
          ← Back to all posts
        </Link>
      </p>
    </div>
  );
}
