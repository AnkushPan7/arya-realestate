"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-card px-6 py-16 text-center shadow-card">
      <Icon className="h-10 w-10 text-text-light" strokeWidth={1.5} />
      <h2 className="mt-4 font-heading text-lg font-bold text-primary">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-text-muted">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          {actionLabel}
        </Link>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-light"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
