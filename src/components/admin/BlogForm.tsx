"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useCreateBlogPost } from "@/hooks/mutations/useCreateBlogPost";
import { useUpdateBlogPost } from "@/hooks/mutations/useUpdateBlogPost";
import type { BlogPost, BlogStatus } from "@/hooks/queries/useBlogPosts";
import { BLOG_CATEGORIES } from "@/lib/sample-blog";
import { slugify } from "@/lib/utils";

type BlogFormProps = {
  post?: BlogPost;
};

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  status: BlogStatus;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
};

const CATEGORY_OPTIONS = BLOG_CATEGORIES.filter((item) => item.value !== "all");

function postToForm(post: BlogPost): FormState {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    coverImageUrl: post.coverImageUrl ?? "",
    category: post.category ?? "",
    tags: post.tags ?? [],
    status: post.status,
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    ogImageUrl: post.ogImageUrl ?? "",
  };
}

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "",
  tags: [],
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  ogImageUrl: "",
};

export function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const isEditing = post !== undefined;
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(
    post ? postToForm(post) : EMPTY_FORM,
  );
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const isSaving = createPost.isPending || updatePost.isPending;

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;

    setForm((current) => {
      if (current.tags.includes(tag)) return current;
      return { ...current, tags: [...current.tags, tag] };
    });
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag),
    }));
  }

  function handleTagKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    } else if (event.key === "Backspace" && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1]);
    }
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

      setForm((current) => ({ ...current, coverImageUrl: json.data!.url }));
      toast.success("Cover image uploaded");
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

  function buildPayload() {
    return {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      coverImageUrl: form.coverImageUrl.trim() || null,
      category: form.category || null,
      tags: form.tags,
      status: form.status,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      ogImageUrl: form.ogImageUrl.trim() || null,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const payload = buildPayload();

    if (isEditing && post) {
      updatePost.mutate(
        { id: post.id, ...payload },
        { onSuccess: () => router.push("/admin/blog") },
      );
    } else {
      createPost.mutate(payload, {
        onSuccess: () => router.push("/admin/blog"),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
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
            required
            value={form.title}
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) => ({
                ...current,
                title: value,
                ...(!slugTouched && !isEditing
                  ? { slug: slugify(value) }
                  : {}),
              }));
            }}
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-primary"
          >
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setForm((current) => ({
                ...current,
                slug: event.target.value,
              }));
            }}
            placeholder="auto-generated-from-title"
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-primary"
        >
          Excerpt
        </label>
        <textarea
          id="excerpt"
          rows={3}
          value={form.excerpt}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              excerpt: event.target.value,
            }))
          }
          className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-primary"
        >
          Content
        </label>
        <p className="mt-0.5 text-xs text-text-muted">Markdown supported</p>
        <textarea
          id="content"
          rows={10}
          value={form.content}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              content: event.target.value,
            }))
          }
          className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary">
          Cover Image
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse disabled:opacity-70"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload Cover"}
          </button>
          {form.coverImageUrl ? (
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, coverImageUrl: "" }))
              }
              className="text-sm text-text-muted hover:text-error"
            >
              Remove
            </button>
          ) : null}
        </div>
        {form.coverImageUrl ? (
          <div className="relative mt-3 aspect-video max-w-md overflow-hidden rounded-xl bg-surface">
            <Image
              src={form.coverImageUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-primary"
          >
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-primary"
          >
            Tags
          </label>
          <div className="mt-1.5 rounded-lg border border-border px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent-subtle px-2 py-1 text-xs font-medium text-accent"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded hover:text-primary"
                    aria-label={`Remove ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => addTag(tagInput)}
                placeholder={form.tags.length ? "" : "Type and press Enter"}
                className="min-w-[120px] flex-1 border-0 bg-transparent py-1 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-primary">Status</span>
        <div className="mt-2 flex gap-2">
          {(["draft", "published"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setForm((current) => ({ ...current, status: value }))
              }
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                form.status === value
                  ? value === "published"
                    ? "bg-success text-white"
                    : "bg-warning text-white"
                  : "border border-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {value === "draft" ? "Draft" : "Published"}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="rounded-2xl bg-card p-5 shadow-card">
        <legend className="px-1 font-heading text-sm font-semibold text-primary">
          SEO
        </legend>
        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="metaTitle"
              className="block text-sm font-medium text-primary"
            >
              Meta Title
            </label>
            <input
              id="metaTitle"
              type="text"
              value={form.metaTitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  metaTitle: event.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="metaDescription"
              className="block text-sm font-medium text-primary"
            >
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={2}
              value={form.metaDescription}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  metaDescription: event.target.value,
                }))
              }
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label
              htmlFor="ogImageUrl"
              className="block text-sm font-medium text-primary"
            >
              OG Image URL
            </label>
            <input
              id="ogImageUrl"
              type="url"
              value={form.ogImageUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ogImageUrl: event.target.value,
                }))
              }
              placeholder="https://..."
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
        <Link
          href="/admin/blog"
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving || uploading}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
        >
          {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Post"}
        </button>
      </div>
    </form>
  );
}
