import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import type { SampleProject } from "@/lib/sample-projects";

const STATUS_BADGE: Record<SampleProject["status"], string> = {
  ongoing: "bg-success/90",
  upcoming: "bg-accent/90",
  completed: "bg-info/90",
};

type ProjectCardProps = {
  project: Pick<
    SampleProject,
    | "title"
    | "slug"
    | "zone"
    | "status"
    | "propertyType"
    | "displayPrice"
    | "bhkOptions"
    | "location"
    | "primaryImageUrl"
  >;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const href = `/projects/${project.zone}/${project.slug}`;
  const bhkLabel =
    project.bhkOptions.length > 0 ? project.bhkOptions.join(", ") : null;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-border">
        {project.primaryImageUrl ? (
          <Image
            src={project.primaryImageUrl}
            alt={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-text-light" strokeWidth={1.5} />
            <span className="text-xs text-text-muted">Images Coming Soon</span>
          </div>
        )}

        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur-sm ${STATUS_BADGE[project.status]}`}
        >
          {project.status}
        </span>
        <span className="absolute right-4 top-4 z-10 rounded-full bg-primary/80 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur-sm">
          {project.zone}
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {project.propertyType}
        </p>
        <h3 className="mt-1 line-clamp-1 font-heading text-lg font-semibold text-primary">
          {project.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
          <span className="line-clamp-1">{project.location}</span>
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="font-heading text-lg font-bold text-accent">
            {project.displayPrice}
          </span>
          {bhkLabel ? (
            <span className="rounded-md bg-surface px-2 py-1 text-xs text-text-muted">
              {bhkLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
