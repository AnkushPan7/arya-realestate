"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSubmitInquiry } from "@/hooks/mutations/useSubmitInquiry";

const inputClassName =
  "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-text transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent";

const compactInputClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-text transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent";

type InquiryFormProps = {
  projectId?: number;
  source?: "contact_form" | "whatsapp" | "project_page";
  compact?: boolean;
  defaultMessage?: string;
};

export function InquiryForm({
  projectId,
  source = "contact_form",
  compact = false,
  defaultMessage = "",
}: InquiryFormProps) {
  const mutation = useSubmitInquiry();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [sent, setSent] = useState(false);

  const fieldClass = compact ? compactInputClassName : inputClassName;
  const resolvedSource = projectId ? "project_page" : source;

  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setMessage(defaultMessage);
    setSent(false);
    mutation.reset();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutation.mutate(
      {
        name,
        phone,
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        source: resolvedSource,
        projectId,
      },
      {
        onSuccess: () => setSent(true),
      },
    );
  }

  if (sent) {
    return (
      <div
        className={`flex flex-col items-center text-center ${
          compact
            ? "rounded-2xl bg-card p-5 shadow-card"
            : "rounded-2xl bg-card p-8 shadow-card sm:p-10"
        }`}
      >
        <CheckCircle2 className="h-10 w-10 text-accent" strokeWidth={1.5} />
        <h2 className="mt-3 font-heading text-lg font-semibold text-primary">
          Message Sent!
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          We&apos;ll get back to you within 24 hours
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-4 rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-text-inverse"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "rounded-2xl bg-card p-5 shadow-card"
          : "rounded-2xl bg-card p-6 shadow-card sm:p-8"
      }
      noValidate
    >
      <h2
        className={`font-heading font-semibold text-primary ${
          compact ? "text-base" : "text-xl"
        }`}
      >
        {compact ? "Enquire Now" : "Send us a message"}
      </h2>
      {!compact ? (
        <p className="mt-2 text-sm text-text-muted">
          Fill in the details below and our team will reach out shortly.
        </p>
      ) : null}

      <input type="hidden" name="source" value={resolvedSource} />

      <div className={compact ? "mt-4 space-y-3" : "mt-6 space-y-4"}>
        <div>
          <label
            htmlFor="inquiry-name"
            className="mb-1.5 block text-sm font-medium text-primary"
          >
            Name <span className="text-error">*</span>
          </label>
          <input
            id="inquiry-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label
            htmlFor="inquiry-phone"
            className="mb-1.5 block text-sm font-medium text-primary"
          >
            Phone <span className="text-error">*</span>
          </label>
          <input
            id="inquiry-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>

        {!compact ? (
          <div>
            <label
              htmlFor="inquiry-email"
              className="mb-1.5 block text-sm font-medium text-primary"
            >
              Email
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="you@example.com"
            />
          </div>
        ) : null}

        <div>
          <label
            htmlFor="inquiry-message"
            className="mb-1.5 block text-sm font-medium text-primary"
          >
            Message
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            rows={compact ? 3 : 4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${fieldClass} min-h-20 resize-y`}
            placeholder="Tell us what you're looking for..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className={`flex w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-70 ${
          compact ? "mt-4 py-2.5" : "mt-6 py-3"
        }`}
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
