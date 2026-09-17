import type { Metadata } from "next";
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ImageGallery } from "@/components/public/ImageGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { Breadcrumbs } from "@/components/public/PageHero";
import { ProjectCard } from "@/components/public/ProjectCard";
import { JsonLd } from "@/components/JsonLd";
import { getProjectBySlugZone, type ResolvedOffice } from "@/lib/public-data";
import type { SampleProject } from "@/lib/sample-projects";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, realEstateListingSchema } from "@/lib/structured-data";
import { telHref, whatsappHref } from "@/lib/site";

/** Metadata builder for `[slug]` project pages — mirrors the page-level data fetch. */
export async function projectDetailMetadata(
  slug: string,
  zone: "east" | "west",
): Promise<Metadata> {
  const project = await getProjectBySlugZone(slug, zone);
  if (!project) {
    return buildPageMetadata({
      title: "Project Not Found",
      description: "This project could not be found.",
      path: `/projects/${zone}/${slug}`,
      noIndex: true,
    });
  }

  const description =
    project.description?.[0] ??
    `${project.title} in ${project.location}. ${project.displayPrice}.`;

  return buildPageMetadata({
    title: `${project.title} — ${project.location}`,
    description,
    path: `/projects/${zone}/${slug}`,
    image: project.primaryImageUrl,
    keywords: [project.title, project.location, project.propertyType, zone],
  });
}

type ProjectDetailProps = {
  project: SampleProject;
  related: SampleProject[];
  zone: "east" | "west";
  office?: ResolvedOffice;
};

function youtubeEmbedSrc(url: string): string | null {
  try {
    if (url.includes("youtube.com/embed/")) return url;
    const parsed = new URL(url);
    const id = parsed.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function ProjectDetail({
  project,
  related,
  zone,
  office = null,
}: ProjectDetailProps) {
  const zoneLabel = zone === "east" ? "East" : "West";
  const wa = whatsappHref(
    `Hi, I'm interested in ${project.title} at ${project.location}. Can you share more details?`,
  );
  const embed = project.videoUrl ? youtubeEmbedSrc(project.videoUrl) : null;
  const gallery =
    project.gallery && project.gallery.length > 0
      ? project.gallery
      : [
          { url: null, altText: `${project.title} view 1` },
          { url: null, altText: `${project.title} view 2` },
          { url: null, altText: `${project.title} view 3` },
          { url: null, altText: `${project.title} view 4` },
        ];

  const metrics = [
    { label: "Price", value: project.displayPrice },
    {
      label: "BHK Options",
      value:
        project.bhkOptions.length > 0
          ? project.bhkOptions.join(", ")
          : "—",
    },
    { label: "Plot Area", value: project.plotArea ?? "—" },
    { label: "Possession Date", value: project.possessionDate ?? "—" },
  ];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: zoneLabel, href: `/projects/${zone}` },
    { label: project.title },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={realEstateListingSchema(project, zone)} />

      <div className="border-b border-border bg-card py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs tone="muted" items={breadcrumbs} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <ImageGallery images={gallery} projectTitle={project.title} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
              {project.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-text-muted">
              <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              {project.location}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold capitalize text-accent-dark">
                {project.status}
              </span>
              <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold capitalize text-accent-dark">
                {project.propertyType}
              </span>
              <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold capitalize text-accent-dark">
                {project.zone}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl bg-card p-4 text-center shadow-card"
                >
                  <p className="text-xs text-text-muted">{metric.label}</p>
                  <p className="mt-1 font-heading text-sm font-semibold text-primary">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-primary">
                About This Project
              </h2>
              <div className="mt-3 space-y-4">
                {(project.description && project.description.length > 0
                  ? project.description
                  : ["Details coming soon."]
                ).map((para) => (
                  <p
                    key={para.slice(0, 24)}
                    className="leading-relaxed text-text-muted"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </section>

            {project.features && project.features.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-primary">
                  Features &amp; Amenities
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-text-muted"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {project.floorPlans && project.floorPlans.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-primary">
                  Floor Plans
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {project.floorPlans.map((plan) => (
                    <article
                      key={plan.title}
                      className="overflow-hidden rounded-xl bg-card shadow-card"
                    >
                      <div className="aspect-4/3 bg-border" aria-hidden />
                      <p className="p-4 text-sm font-medium text-primary">
                        {plan.title}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {embed ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-primary">
                  Project Video
                </h2>
                <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-border">
                  <iframe
                    src={embed}
                    title={`${project.title} video`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <p className="text-xs text-text-muted">Starting from</p>
              <p className="mt-1 font-heading text-2xl font-bold text-accent">
                {project.displayPrice}
              </p>
              {project.bhkOptions.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.bhkOptions.map((bhk) => (
                    <span
                      key={bhk}
                      className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {bhk}
                    </span>
                  ))}
                </div>
              ) : null}

              {project.reraNumber ? (
                <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent"
                    aria-hidden
                  />
                  <span>RERA: {project.reraNumber}</span>
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <InquiryForm
                projectId={project.id}
                compact
                defaultMessage={`I'm interested in ${project.title}.`}
              />
            </div>

            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                Chat About This Project
              </a>
            ) : null}

            {office ? (
              <div className="mt-6 border-t border-border pt-6">
                <p className="text-xs text-text-muted">Visit Our Office</p>
                <p className="mt-2 text-sm font-medium text-primary">
                  {office.name}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  {office.addressShort}
                </p>
                <a
                  href={telHref(office.phone)}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden />
                  {office.phone}
                </a>
              </div>
            ) : null}
          </aside>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="border-t border-border bg-card py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Similar Projects in {zoneLabel} Ahmedabad
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.slug} project={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
