"use client";

import { useState } from "react";
import { useSiteSettings } from "@/hooks/queries/useSiteSettings";
import { useUpdateSiteSettings } from "@/hooks/mutations/useUpdateSiteSettings";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

type FormState = {
  companyName: string;
  tagline: string;
  email: string;
  whatsappNumber: string;
  googleReviewsPlaceId: string;
  footerText: string;
  copyrightText: string;
  logoUrl: string;
  defaultOgImage: string;
};

const EMPTY_FORM: FormState = {
  companyName: "",
  tagline: "",
  email: "",
  whatsappNumber: "",
  googleReviewsPlaceId: "",
  footerText: "",
  copyrightText: "",
  logoUrl: "",
  defaultOgImage: "",
};

function formFromSettings(
  settings: NonNullable<ReturnType<typeof useSiteSettings>["data"]>,
): FormState {
  return {
    companyName: settings.companyName ?? "",
    tagline: settings.tagline ?? "",
    email: settings.email ?? "",
    whatsappNumber: settings.whatsappNumber ?? "",
    googleReviewsPlaceId: settings.googleReviewsPlaceId ?? "",
    footerText: settings.footerText ?? "",
    copyrightText: settings.copyrightText ?? "",
    logoUrl: settings.logoUrl ?? "",
    defaultOgImage: settings.defaultOgImage ?? "",
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent";

function SiteSettingsForm({ initial }: { initial: FormState }) {
  const updateSettings = useUpdateSiteSettings();
  const [form, setForm] = useState<FormState>(initial);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateSettings.mutate(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-xl bg-card p-6 shadow-card"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Company Name">
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Tagline">
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClassName}
          />
        </Field>

        <Field label="WhatsApp Number">
          <input
            type="text"
            value={form.whatsappNumber}
            onChange={(e) => handleChange("whatsappNumber", e.target.value)}
            placeholder="+91 99781 49329"
            className={inputClassName}
          />
        </Field>

        <Field label="Google Reviews Place ID">
          <input
            type="text"
            value={form.googleReviewsPlaceId}
            onChange={(e) =>
              handleChange("googleReviewsPlaceId", e.target.value)
            }
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Footer Text">
        <textarea
          value={form.footerText}
          onChange={(e) => handleChange("footerText", e.target.value)}
          rows={3}
          className={inputClassName}
        />
      </Field>

      <Field label="Copyright Text">
        <input
          type="text"
          value={form.copyrightText}
          onChange={(e) => handleChange("copyrightText", e.target.value)}
          className={inputClassName}
        />
      </Field>

      <Field label="Logo URL">
        <input
          type="url"
          value={form.logoUrl}
          onChange={(e) => handleChange("logoUrl", e.target.value)}
          placeholder="https://..."
          className={inputClassName}
        />
        {form.logoUrl.trim() ? (
          <div className="mt-3 flex items-center gap-4 rounded-lg border border-border-light bg-surface p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logoUrl}
              alt="Logo preview"
              className="h-16 w-auto max-w-[200px] object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <p className="text-xs text-text-muted">Logo preview</p>
          </div>
        ) : null}
      </Field>

      <Field label="Default OG Image URL">
        <input
          type="url"
          value={form.defaultOgImage}
          onChange={(e) => handleChange("defaultOgImage", e.target.value)}
          placeholder="https://..."
          className={inputClassName}
        />
        {form.defaultOgImage.trim() ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-border-light bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.defaultOgImage}
              alt="OG image preview"
              className="h-40 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}
      </Field>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
        >
          {updateSettings.isPending ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </form>
  );
}

export default function AdminSiteSettingsPage() {
  const { data, isLoading, isError, error, refetch } = useSiteSettings();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <SkeletonText className="mt-2 w-72" />
        <div className="mt-8 space-y-6 rounded-xl bg-card p-6 shadow-card">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <AdminErrorState
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
        Site Settings
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Manage global branding, contact details, and footer content
      </p>

      <SiteSettingsForm
        key={data?.id ?? "empty"}
        initial={data ? formFromSettings(data) : EMPTY_FORM}
      />
    </div>
  );
}
