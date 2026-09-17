import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BlogCard } from "@/components/public/BlogCard";
import { BlogCategoryFilters } from "@/components/public/BlogCategoryFilters";
import { PageHero } from "@/components/public/PageHero";
import {
  getBlogCategoryOptions,
  getPublishedPosts,
} from "@/lib/public-data";
import {
  absoluteUrl,
  buildCollectionPageJsonLd,
  buildPageMetadata,
  firstSearchParam,
} from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TITLE = "Blog";
const DESCRIPTION =
  "Real estate tips, Ahmedabad market updates, and project news from Arya Real Estate — practical insights for buyers and families.";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/blog",
    keywords: [
      "Ahmedabad real estate blog",
      "property buying guide",
      "market updates Ahmedabad",
    ],
  });
}

export default async function BlogPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const category = firstSearchParam(searchParams.category) ?? "all";
  const [posts, categoryOptions] = await Promise.all([
    getPublishedPosts(category),
    getBlogCategoryOptions(),
  ]);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Blog" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: "Insights & Updates",
          description: DESCRIPTION,
          path: "/blog",
          itemUrls: posts.map((post) => absoluteUrl(`/blog/${post.slug}`)),
        })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        title="Insights & Updates"
        subtitle="Real estate tips, Ahmedabad market updates, and project news — written to help you decide with clarity."
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BlogCategoryFilters
            currentCategory={category}
            categories={categoryOptions}
          />

          {posts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center">
              <FileText
                className="h-12 w-12 text-text-light"
                strokeWidth={1.5}
              />
              <p className="mt-4 text-lg font-semibold text-primary">
                No articles yet
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Check back soon for real estate insights.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
