"use client";

import { useRouter } from "next/navigation";

type ProjectFiltersProps = {
  currentZone?: string;
  currentStatus?: string;
  currentType?: string;
};

const ZONE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "east", label: "East" },
  { value: "west", label: "West" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
] as const;

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "apartment", label: "Apartment" },
  { value: "bungalow", label: "Bungalow" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "plot", label: "Plot" },
  { value: "land", label: "Land" },
] as const;

function pillClass(active: boolean) {
  return active
    ? "rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors"
    : "rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent";
}

/** Zone is path-based (/projects, /projects/east, /projects/west); status & type are query params. */
export function ProjectFilters({
  currentZone = "all",
  currentStatus = "all",
  currentType = "all",
}: ProjectFiltersProps) {
  const router = useRouter();

  function buildPath(zone: string, status: string, type: string) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);

    const base =
      zone === "east"
        ? "/projects/east"
        : zone === "west"
          ? "/projects/west"
          : "/projects";

    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  function setZone(zone: string) {
    router.push(buildPath(zone, currentStatus, currentType));
  }

  function setStatus(status: string) {
    router.push(buildPath(currentZone, status, currentType));
  }

  function setType(type: string) {
    router.push(buildPath(currentZone, currentStatus, type));
  }

  return (
    <div className="flex flex-wrap gap-3" role="search" aria-label="Project filters">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Zone">
        {ZONE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={pillClass(currentZone === option.value)}
            onClick={() => setZone(option.value)}
            aria-pressed={currentZone === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Status">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={pillClass(currentStatus === option.value)}
            onClick={() => setStatus(option.value)}
            aria-pressed={currentStatus === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Property type">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={pillClass(currentType === option.value)}
            onClick={() => setType(option.value)}
            aria-pressed={currentType === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
