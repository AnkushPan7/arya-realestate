import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/seo";

type PageHeroProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
};

/**
 * Standard public page hero — navy band with breadcrumbs + headline.
 */
export function PageHero({ breadcrumbs, title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-primary py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} tone="inverse" />
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-text-inverse md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-lg text-text-inverse/70">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  tone?: "inverse" | "muted";
  className?: string;
};

export function Breadcrumbs({
  items,
  tone = "inverse",
  className = "",
}: BreadcrumbsProps) {
  const base =
    tone === "inverse"
      ? "text-xs text-text-inverse/50"
      : "text-sm text-text-muted";
  const current =
    tone === "inverse" ? "text-text-inverse/70" : "text-primary";

  return (
    <nav aria-label="Breadcrumb" className={`${base} ${className}`.trim()}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((crumb, i) => (
          <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="transition-colors hover:text-accent"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className={`line-clamp-1 ${current}`} aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
