"use client";

import { BlogForm } from "@/components/admin/BlogForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          New Post
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Write and publish a new blog article
        </p>
      </div>

      <div className="mt-8 max-w-3xl">
        <BlogForm />
      </div>
    </div>
  );
}
