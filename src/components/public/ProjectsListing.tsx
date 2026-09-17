import Link from "next/link";
import { Building2 } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/public/PageHero";
import { ProjectCard } from "@/components/public/ProjectCard";
import { ProjectFilters } from "@/components/public/ProjectFilters";
import { getProjectsFiltered, type ProjectListFilters } from "@/lib/public-data";
import {
  absoluteUrl,
  buildCollectionPageJsonLd,
  firstSearchParam,
  type BreadcrumbItem,
} from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/structured-data";
import {
  projectStatusSchema,
  propertyTypeSchema,
} from "@/lib/validations/projects";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type ProjectsListingProps = {
  breadcrumbs: BreadcrumbItem[];
  headline: string;
  subtitle: string;
  path: string;
  fixedZone?: "east" | "west";
  status?: string;
  type?: string;
  resetHref: string;
};

export async function ProjectsListing({
  breadcrumbs,
  headline,
  subtitle,
  path,
  fixedZone,
  status = "all",
  type = "all",
  resetHref,
}: ProjectsListingProps) {
  const zone = fixedZone ?? "all";
  const parsedStatus = projectStatusSchema.safeParse(status);
  const parsedType = propertyTypeSchema.safeParse(type);

  const filters: ProjectListFilters = {
    zone: fixedZone,
    status: parsedStatus.success ? parsedStatus.data : undefined,
    propertyType: parsedType.success ? parsedType.data : undefined,
  };

  const projects = await getProjectsFiltered(filters);

  const itemUrls = projects.map((project) =>
    absoluteUrl(`/projects/${project.zone}/${project.slug}`),
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: headline,
          description: subtitle,
          path,
          itemUrls,
        })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        title={headline}
        subtitle={subtitle}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProjectFilters
            currentZone={zone}
            currentStatus={status || "all"}
            currentType={type || "all"}
          />

          {projects.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center">
              <Building2
                className="h-12 w-12 text-text-light"
                strokeWidth={1.5}
              />
              <p className="mt-4 text-lg font-semibold text-primary">
                No projects found
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Try adjusting your filters
              </p>
              <Link
                href={resetHref}
                className="mt-6 rounded-xl border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-text-inverse"
              >
                Reset Filters
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/** Shared searchParams parser for listing routes */
export function parseListingSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return {
    status: firstSearchParam(searchParams.status) ?? "all",
    type: firstSearchParam(searchParams.type) ?? "all",
  };
}

export type { SearchParams };
