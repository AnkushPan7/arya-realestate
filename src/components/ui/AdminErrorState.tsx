"use client";

import { AlertCircle } from "lucide-react";

type AdminErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function AdminErrorState({
  message = "Something went wrong",
  onRetry,
}: AdminErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-card px-6 py-16 text-center shadow-card">
      <AlertCircle className="h-10 w-10 text-error" />
      <h2 className="mt-4 font-heading text-lg font-bold text-primary">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-text-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-xl border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary hover:text-text-inverse"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}
