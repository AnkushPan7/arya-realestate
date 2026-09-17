import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { SVGProps } from "react";
import { MessageCircle } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BlogCard } from "@/components/public/BlogCard";
import { Breadcrumbs } from "@/components/public/PageHero";
import {
  getPublishedPostBySlug,
  getRelatedPublishedPosts,
} from "@/lib/public-data";
import { formatBlogDate } from "@/lib/sample-blog";
import { buildPageMetadata } from "@/lib/seo";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/structured-data";
import { getSiteUrl } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) {
    return buildPageMetadata({
      title: "Article Not Found",
      description: "This article could not be found.",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    authors: [post.author],
    image: post.coverImageUrl,
    keywords: [...post.tags, post.categoryLabel],
  });
}

function IconLinkedIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.3 9.2H3.4V20.5h2.9V9.2zM4.85 4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20.6 13.3c0-3.1-1.7-4.5-3.9-4.5-1.8 0-2.6 1-3.1 1.7V9.2H10.8c0 .6 0 11.3 0 11.3h2.9v-6.3c0-.3 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.6v6.2h2.9v-6.4z" />
    </svg>
  );
}

function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.5 3.5h2.7l-5.9 6.7L22 20.5h-5.8l-4.5-5.9-5.2 5.9H3.8l6.3-7.2L2 3.5h6l4.1 5.4 5.4-5.4zm-1 15.3h1.5L7.6 5.1H6L16.5 18.8z" />
    </svg>
  );
}

export default async function BlogPostPage(props: { params: Params }) {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPublishedPosts(slug, 3);
  const path = `/blog/${post.slug}`;
  const postUrl = `${getSiteUrl()}${path}`;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title },
  ];

  const shareWhatsApp = `https://wa.me/?text=${encodeURIComponent(
    `${post.title} — ${postUrl}`,
  )}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
  const shareX = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={blogPostingSchema(post)} />

      <section className="bg-primary py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs tone="inverse" items={breadcrumbs} />

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent">
            {post.categoryLabel}
          </p>
          <h1 className="mt-3 max-w-4xl font-heading text-3xl font-bold tracking-tight text-text-inverse md:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-text-inverse/60">
            <span>{post.author}</span>
            {" · "}
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
            {" · "}
            {post.readTimeMinutes} min read
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-border shadow-elevated">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-border via-border-light to-border"
              aria-hidden
            />
          )}
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {post.content.length > 0 ? (
          post.content.map((block, index) => {
            const key = `${block.type}-${index}`;
            if (block.type === "h2") {
              return (
                <h2
                  key={key}
                  className="mt-8 mb-4 font-heading text-2xl font-bold text-primary"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "h3") {
              return (
                <h3
                  key={key}
                  className="mt-6 mb-3 font-heading text-xl font-bold text-primary"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "blockquote") {
              return (
                <blockquote
                  key={key}
                  className="mt-4 border-l-2 border-accent pl-4 text-text-muted italic"
                >
                  {block.text}
                </blockquote>
              );
            }
            return (
              <p key={key} className="mt-4 leading-relaxed text-text-muted">
                {block.text}
              </p>
            );
          })
        ) : (
          <p className="leading-relaxed text-text-muted">
            {post.excerpt || "Full article coming soon."}
          </p>
        )}

        {post.tags.length > 0 ? (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-medium text-primary">Tags:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <p className="text-sm text-text-muted">Share this article</p>
          <div className="mt-3 flex gap-2">
            <a
              href={shareWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={shareLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <IconLinkedIn className="h-4 w-4" />
            </a>
            <a
              href={shareX}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:border-accent hover:bg-accent hover:text-white"
            >
              <IconX className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
              More Articles
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.slug} post={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
