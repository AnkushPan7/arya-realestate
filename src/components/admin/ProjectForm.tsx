"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateProject } from "@/hooks/mutations/useCreateProject";
import { useUpdateProject } from "@/hooks/mutations/useUpdateProject";
import { projectKeys } from "@/hooks/keys";
import type { Project } from "@/hooks/queries/useProjects";
import {
  projectFieldsSchema,
  type ProjectInput,
} from "@/lib/validations/projects";

type ProjectFormProps = {
  mode: "create" | "edit";
  initialData?: Project;
};

type FormState = {
  title: string;
  zone: "east" | "west";
  status: "upcoming" | "ongoing" | "completed";
  propertyType: Project["propertyType"];
  bhkOptions: string[];
  priceMin: string;
  priceMax: string;
  displayPrice: string;
  location: string;
  address: string;
  pincode: string;
  plotArea: string;
  areaUnit: string;
  description: string;
  features: string[];
  reraNumber: string;
  possessionDate: string;
  videoUrl: string;
  isFeatured: boolean;
  displayOrder: string;
  metaTitle: string;
  metaDescription: string;
};

const DEFAULT_FORM: FormState = {
  title: "",
  zone: "east",
  status: "ongoing",
  propertyType: "apartment",
  bhkOptions: [],
  priceMin: "",
  priceMax: "",
  displayPrice: "",
  location: "",
  address: "",
  pincode: "",
  plotArea: "",
  areaUnit: "sq.yards",
  description: "",
  features: [],
  reraNumber: "",
  possessionDate: "",
  videoUrl: "",
  isFeatured: false,
  displayOrder: "0",
  metaTitle: "",
  metaDescription: "",
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

function projectToForm(project: Project): FormState {
  return {
    title: project.title,
    zone: project.zone,
    status: project.status,
    propertyType: project.propertyType,
    bhkOptions: project.bhkOptions ?? [],
    priceMin: project.priceMin ?? "",
    priceMax: project.priceMax ?? "",
    displayPrice: project.displayPrice ?? "",
    location: project.location,
    address: project.address ?? "",
    pincode: project.pincode ?? "",
    plotArea: project.plotArea ?? "",
    areaUnit: project.areaUnit ?? "sq.yards",
    description: project.description ?? "",
    features: project.features ?? [],
    reraNumber: project.reraNumber ?? "",
    possessionDate: project.possessionDate ?? "",
    videoUrl: project.videoUrl ?? "",
    isFeatured: project.isFeatured,
    displayOrder: String(project.displayOrder),
    metaTitle: project.metaTitle ?? "",
    metaDescription: project.metaDescription ?? "",
  };
}

function formToInput(form: FormState): ProjectInput {
  return {
    title: form.title.trim(),
    zone: form.zone,
    status: form.status,
    propertyType: form.propertyType,
    bhkOptions: form.bhkOptions,
    priceMin: form.priceMin ? Number(form.priceMin) : null,
    priceMax: form.priceMax ? Number(form.priceMax) : null,
    displayPrice: form.displayPrice.trim() || undefined,
    location: form.location.trim(),
    address: form.address.trim() || undefined,
    pincode: form.pincode.trim() || undefined,
    plotArea: form.plotArea.trim() || undefined,
    areaUnit: form.areaUnit.trim() || undefined,
    description: form.description.trim() || undefined,
    features: form.features,
    reraNumber: form.reraNumber.trim() || undefined,
    possessionDate: form.possessionDate.trim() || undefined,
    videoUrl: form.videoUrl.trim() || undefined,
    isFeatured: form.isFeatured,
    displayOrder: Number(form.displayOrder) || 0,
    metaTitle: form.metaTitle.trim() || undefined,
    metaDescription: form.metaDescription.trim() || undefined,
  };
}

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function addTag() {
    const value = input.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setInput("");
  }

  return (
    <div>
      <label className="block text-sm font-medium text-primary">{label}</label>
      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={addTag}
          className="rounded-xl border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
        >
          Add
        </button>
      </div>
      {tags.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-accent-subtle px-2.5 py-1 text-xs font-medium text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((item) => item !== tag))}
                className="rounded-full p-0.5 hover:bg-accent/20"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-6 shadow-card">
      <h2 className="font-heading text-lg font-semibold text-primary">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent";

const labelClass = "block text-sm font-medium text-primary";

export function ProjectForm({ mode, initialData }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [form, setForm] = useState<FormState>(() =>
    initialData ? projectToForm(initialData) : DEFAULT_FORM,
  );

  const mediaFileRef = useRef<HTMLInputElement>(null);
  const floorPlanFileRef = useRef<HTMLInputElement>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [mediaPrimary, setMediaPrimary] = useState(false);
  const [floorPlanTitle, setFloorPlanTitle] = useState("");
  const [floorPlanUrl, setFloorPlanUrl] = useState("");

  const isSaving = createProject.isPending || updateProject.isPending;
  const projectId = initialData?.id;
  const embedSrc = form.videoUrl ? youtubeEmbedSrc(form.videoUrl) : null;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    const json = (await res.json()) as {
      data?: { url: string };
      error?: string;
    };

    if (!res.ok || !json.data) {
      throw new Error(json.error ?? "Unable to upload image");
    }

    return json.data.url;
  }

  async function refreshProject() {
    if (!projectId) return;
    await queryClient.invalidateQueries({
      queryKey: projectKeys.detailById(projectId),
    });
  }

  async function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !projectId) return;

    setUploadingMedia(true);
    try {
      const url = await uploadFile(file);
      const res = await fetch(`/api/projects/${projectId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          mediaType: "image",
          isPrimary: mediaPrimary,
          altText: form.title || undefined,
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Unable to add media");
      }

      toast.success("Image added");
      setMediaPrimary(false);
      await refreshProject();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleDeleteMedia(mediaId: number) {
    if (!projectId) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/media`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Unable to delete media");
      }

      toast.success("Image removed");
      await refreshProject();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete media",
      );
    }
  }

  async function handleFloorPlanFileUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingFloorPlan(true);
    try {
      const url = await uploadFile(file);
      setFloorPlanUrl(url);
      toast.success("Floor plan image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image",
      );
    } finally {
      setUploadingFloorPlan(false);
    }
  }

  async function handleAddFloorPlan() {
    if (!projectId) return;

    if (!floorPlanTitle.trim()) {
      toast.error("Floor plan title is required");
      return;
    }
    if (!floorPlanUrl.trim()) {
      toast.error("Floor plan image is required");
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/floor-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: floorPlanTitle.trim(),
          imageUrl: floorPlanUrl.trim(),
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Unable to add floor plan");
      }

      toast.success("Floor plan added");
      setFloorPlanTitle("");
      setFloorPlanUrl("");
      await refreshProject();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to add floor plan",
      );
    }
  }

  async function handleDeleteFloorPlan(floorPlanId: number) {
    if (!projectId) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/floor-plans`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floorPlanId }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Unable to delete floor plan");
      }

      toast.success("Floor plan removed");
      await refreshProject();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete floor plan",
      );
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = projectFieldsSchema.safeParse(formToInput(form));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    if (mode === "create") {
      createProject.mutate(parsed.data, {
        onSuccess: (project) => {
          router.push(`/admin/projects/${project.id}`);
        },
      });
      return;
    }

    if (!projectId) return;

    updateProject.mutate(
      { id: projectId, ...parsed.data },
      {
        onSuccess: () => {
          toast.success("Project updated");
        },
      },
    );
  }

  const media = initialData?.media ?? [];
  const floorPlans = initialData?.floorPlans ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Basic Info">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="zone" className={labelClass}>
              Zone
            </label>
            <select
              id="zone"
              value={form.zone}
              onChange={(event) =>
                updateField("zone", event.target.value as FormState["zone"])
              }
              className={inputClass}
            >
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as FormState["status"])
              }
              className={inputClass}
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Property Type
            </label>
            <select
              id="propertyType"
              value={form.propertyType}
              onChange={(event) =>
                updateField(
                  "propertyType",
                  event.target.value as FormState["propertyType"],
                )
              }
              className={inputClass}
            >
              <option value="apartment">Apartment</option>
              <option value="bungalow">Bungalow</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="plot">Plot</option>
              <option value="land">Land</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              required
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>
              Address
            </label>
            <input
              id="address"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="pincode" className={labelClass}>
              Pincode
            </label>
            <input
              id="pincode"
              value={form.pincode}
              onChange={(event) => updateField("pincode", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Details">
        <TagInput
          label="BHK Options"
          tags={form.bhkOptions}
          onChange={(tags) => updateField("bhkOptions", tags)}
          placeholder="e.g. 2 BHK"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="priceMin" className={labelClass}>
              Price Min (₹)
            </label>
            <input
              id="priceMin"
              type="number"
              min={0}
              value={form.priceMin}
              onChange={(event) => updateField("priceMin", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="priceMax" className={labelClass}>
              Price Max (₹)
            </label>
            <input
              id="priceMax"
              type="number"
              min={0}
              value={form.priceMax}
              onChange={(event) => updateField("priceMax", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="displayPrice" className={labelClass}>
              Display Price
            </label>
            <input
              id="displayPrice"
              value={form.displayPrice}
              onChange={(event) =>
                updateField("displayPrice", event.target.value)
              }
              placeholder="₹52L – ₹63L"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="plotArea" className={labelClass}>
              Plot Area
            </label>
            <input
              id="plotArea"
              value={form.plotArea}
              onChange={(event) => updateField("plotArea", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="areaUnit" className={labelClass}>
              Area Unit
            </label>
            <input
              id="areaUnit"
              value={form.areaUnit}
              onChange={(event) => updateField("areaUnit", event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="possessionDate" className={labelClass}>
              Possession Date
            </label>
            <input
              id="possessionDate"
              value={form.possessionDate}
              onChange={(event) =>
                updateField("possessionDate", event.target.value)
              }
              placeholder="Dec 2027"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="reraNumber" className={labelClass}>
              RERA Number
            </label>
            <input
              id="reraNumber"
              value={form.reraNumber}
              onChange={(event) =>
                updateField("reraNumber", event.target.value)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="displayOrder" className={labelClass}>
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              value={form.displayOrder}
              onChange={(event) =>
                updateField("displayOrder", event.target.value)
              }
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className={inputClass}
          />
        </div>

        <TagInput
          label="Features"
          tags={form.features}
          onChange={(tags) => updateField("features", tags)}
          placeholder="e.g. Covered parking"
        />
      </Section>

      <Section title="Media">
        {mode === "create" ? (
          <p className="text-sm text-text-muted">
            Save the project first to upload images.
          </p>
        ) : (
          <>
            <input
              ref={mediaFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleMediaUpload}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={uploadingMedia}
                onClick={() => mediaFileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse disabled:opacity-70"
              >
                <Upload className="h-4 w-4" />
                {uploadingMedia ? "Uploading…" : "Upload Image"}
              </button>
              <label className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={mediaPrimary}
                  onChange={(event) => setMediaPrimary(event.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                Set as primary
              </label>
            </div>

            {media.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {media.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl bg-surface shadow-card"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={item.url}
                        alt={item.altText ?? "Project media"}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      {item.isPrimary ? (
                        <span className="absolute left-2 top-2 rounded-lg bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                          Primary
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <p className="truncate text-xs text-text-muted">
                        {item.altText ?? "Image"}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleDeleteMedia(item.id)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-error-light hover:text-error"
                        aria-label="Delete image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No images uploaded yet.</p>
            )}
          </>
        )}
      </Section>

      <Section title="Floor Plans">
        {mode === "create" ? (
          <p className="text-sm text-text-muted">
            Save the project first to upload floor plans.
          </p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="floorPlanTitle" className={labelClass}>
                  Title
                </label>
                <input
                  id="floorPlanTitle"
                  value={floorPlanTitle}
                  onChange={(event) => setFloorPlanTitle(event.target.value)}
                  placeholder="2 BHK Layout"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="floorPlanUrl" className={labelClass}>
                  Image URL
                </label>
                <input
                  id="floorPlanUrl"
                  type="url"
                  value={floorPlanUrl}
                  onChange={(event) => setFloorPlanUrl(event.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                ref={floorPlanFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFloorPlanFileUpload}
              />
              <button
                type="button"
                disabled={uploadingFloorPlan}
                onClick={() => floorPlanFileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse disabled:opacity-70"
              >
                <Upload className="h-4 w-4" />
                {uploadingFloorPlan ? "Uploading…" : "Upload Floor Plan"}
              </button>
              <button
                type="button"
                onClick={() => void handleAddFloorPlan()}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light"
              >
                <Plus className="h-4 w-4" />
                Add Floor Plan
              </button>
            </div>

            {floorPlans.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {floorPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="overflow-hidden rounded-xl bg-surface shadow-card"
                  >
                    <div className="relative aspect-4/3">
                      <Image
                        src={plan.imageUrl}
                        alt={plan.title}
                        fill
                        className="object-contain"
                        sizes="400px"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3">
                      <p className="text-sm font-medium text-primary">
                        {plan.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleDeleteFloorPlan(plan.id)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-error-light hover:text-error"
                        aria-label="Delete floor plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No floor plans yet.</p>
            )}
          </>
        )}
      </Section>

      <Section title="Video">
        <div>
          <label htmlFor="videoUrl" className={labelClass}>
            YouTube URL
          </label>
          <input
            id="videoUrl"
            type="url"
            value={form.videoUrl}
            onChange={(event) => updateField("videoUrl", event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>
        {embedSrc ? (
          <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
            <iframe
              src={embedSrc}
              title="YouTube preview"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </Section>

      <Section title="SEO & Featured">
        <div>
          <label htmlFor="metaTitle" className={labelClass}>
            Meta Title
          </label>
          <input
            id="metaTitle"
            value={form.metaTitle}
            onChange={(event) => updateField("metaTitle", event.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="metaDescription" className={labelClass}>
            Meta Description
          </label>
          <textarea
            id="metaDescription"
            rows={3}
            value={form.metaDescription}
            onChange={(event) =>
              updateField("metaDescription", event.target.value)
            }
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(event) => updateField("isFeatured", event.target.checked)}
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm font-medium text-primary">
            Featured project
          </span>
        </label>
      </Section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/admin/projects"
          className="rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
        >
          {isSaving
            ? "Saving…"
            : mode === "create"
              ? "Create Project"
              : "Update Project"}
        </button>
      </div>
    </form>
  );
}
