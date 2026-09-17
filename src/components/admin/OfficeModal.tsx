"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { Office } from "@/hooks/queries/useOffices";
import type {
  OfficeInput,
  SocialLinkInput,
  SocialPlatform,
} from "@/lib/validations/offices";

const PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Google" },
  { value: "twitter", label: "Twitter" },
];

type OfficeModalProps = {
  isOpen: boolean;
  office?: Office | null;
  onClose: () => void;
  onSubmit: (data: OfficeInput) => void;
  loading?: boolean;
};

type FormState = {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumbers: string[];
  email: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  displayOrder: number;
  isActive: boolean;
  socialLinks: SocialLinkInput[];
};

const EMPTY_FORM: FormState = {
  name: "",
  address: "",
  city: "Ahmedabad",
  state: "Gujarat",
  pincode: "",
  phoneNumbers: [""],
  email: "",
  googleMapsUrl: "",
  googleMapsEmbedUrl: "",
  displayOrder: 0,
  isActive: true,
  socialLinks: [],
};

function formFromOffice(office: Office): FormState {
  return {
    name: office.name,
    address: office.address,
    city: office.city,
    state: office.state,
    pincode: office.pincode ?? "",
    phoneNumbers:
      office.phoneNumbers && office.phoneNumbers.length > 0
        ? office.phoneNumbers
        : [""],
    email: office.email ?? "",
    googleMapsUrl: office.googleMapsUrl ?? "",
    googleMapsEmbedUrl: office.googleMapsEmbedUrl ?? "",
    displayOrder: office.displayOrder,
    isActive: office.isActive,
    socialLinks: office.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      displayOrder: link.displayOrder,
      isActive: link.isActive,
    })),
  };
}

function toOfficeInput(form: FormState): OfficeInput {
  return {
    name: form.name,
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode || undefined,
    phoneNumbers: form.phoneNumbers.filter((phone) => phone.trim() !== ""),
    email: form.email || undefined,
    googleMapsUrl: form.googleMapsUrl || undefined,
    googleMapsEmbedUrl: form.googleMapsEmbedUrl || undefined,
    displayOrder: form.displayOrder,
    isActive: form.isActive,
    socialLinks: form.socialLinks
      .filter((link) => link.url.trim() !== "")
      .map((link, index) => ({
        ...link,
        displayOrder: index,
      })),
  };
}

const inputClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent";

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

function OfficeModalForm({
  office,
  onClose,
  onSubmit,
  loading = false,
}: {
  office?: Office | null;
  onClose: () => void;
  onSubmit: (data: OfficeInput) => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<FormState>(() =>
    office ? formFromOffice(office) : EMPTY_FORM,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(toOfficeInput(form));
  }

  function updatePhone(index: number, value: string) {
    setForm((prev) => {
      const phoneNumbers = [...prev.phoneNumbers];
      phoneNumbers[index] = value;
      return { ...prev, phoneNumbers };
    });
  }

  function addPhone() {
    setForm((prev) => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, ""],
    }));
  }

  function removePhone(index: number) {
    setForm((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.filter((_, i) => i !== index),
    }));
  }

  function addSocialLink() {
    setForm((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: "facebook", url: "", displayOrder: prev.socialLinks.length, isActive: true },
      ],
    }));
  }

  function updateSocialLink(
    index: number,
    field: keyof SocialLinkInput,
    value: string | boolean,
  ) {
    setForm((prev) => {
      const socialLinks = [...prev.socialLinks];
      socialLinks[index] = { ...socialLinks[index], [field]: value };
      return { ...prev, socialLinks };
    });
  }

  function removeSocialLink(index: number) {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-primary/30 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="office-modal-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-elevated"
      >
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <h2
            id="office-modal-title"
            className="font-heading text-lg font-bold text-primary"
          >
            {office ? "Edit Office" : "Add Office"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Office Name">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Display Order">
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      displayOrder: Number(e.target.value) || 0,
                    }))
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field label="Address">
              <textarea
                required
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
                rows={2}
                className={inputClassName}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="City">
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="State">
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, state: e.target.value }))
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Pincode">
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, pincode: e.target.value }))
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  Phone Numbers
                </span>
                <button
                  type="button"
                  onClick={addPhone}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-light"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add phone
                </button>
              </div>
              <div className="space-y-2">
                {form.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      placeholder="+91 ..."
                      className={inputClassName}
                    />
                    {form.phoneNumbers.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="rounded-lg border border-border px-3 text-text-muted hover:bg-surface"
                        aria-label="Remove phone"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Google Maps URL">
              <input
                type="url"
                value={form.googleMapsUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    googleMapsUrl: e.target.value,
                  }))
                }
                className={inputClassName}
              />
            </Field>

            <Field label="Google Maps Embed URL">
              <input
                type="url"
                value={form.googleMapsEmbedUrl}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    googleMapsEmbedUrl: e.target.value,
                  }))
                }
                className={inputClassName}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="rounded border-border text-accent focus:ring-accent"
              />
              Active on website
            </label>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">
                  Social Links
                </span>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-light"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add link
                </button>
              </div>
              {form.socialLinks.length === 0 ? (
                <p className="text-sm text-text-muted">No social links yet.</p>
              ) : (
                <div className="space-y-3">
                  {form.socialLinks.map((link, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg border border-border-light bg-surface p-3 sm:grid-cols-[140px_1fr_auto]"
                    >
                      <select
                        value={link.platform}
                        onChange={(e) =>
                          updateSocialLink(
                            index,
                            "platform",
                            e.target.value as SocialPlatform,
                          )
                        }
                        className={inputClassName}
                      >
                        {PLATFORMS.map((platform) => (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateSocialLink(index, "url", e.target.value)
                        }
                        placeholder="https://..."
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="rounded-lg border border-border px-3 text-text-muted hover:bg-card"
                        aria-label="Remove social link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border-light pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-70"
            >
              {loading ? "Saving…" : office ? "Save Changes" : "Create Office"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function OfficeModal({
  isOpen,
  office,
  onClose,
  onSubmit,
  loading = false,
}: OfficeModalProps) {
  if (!isOpen) return null;

  return (
    <OfficeModalForm
      key={office?.id ?? "new"}
      office={office}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
    />
  );
}
