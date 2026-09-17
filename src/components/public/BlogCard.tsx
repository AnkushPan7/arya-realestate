import Image from "next/image";
import Link from "next/link";
import { Building2, Calendar, Clock } from "lucide-react";
import type { SampleBlogPost } from "@/lib/sample-blog";
import { formatBlogDate } from "@/lib/sample-blog";

type BlogCardProps = {
  post: SampleBlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-border">
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-border via-border-light to-border transition-transform duration-500 group-hover:scale-105">
            <Building2 className="h-8 w-8 text-text-light" strokeWidth={1.5} />
            <span className="text-xs text-text-muted">Cover Coming Soon</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {post.categoryLabel}
        </p>
        <h2 className="mt-2 line-clamp-2 font-heading text-lg font-semibold text-primary transition-colors group-hover:text-accent">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-text-muted">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-text-light">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            {formatBlogDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {post.readTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}
