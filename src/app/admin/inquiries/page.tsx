"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useInquiries } from "@/hooks/queries/useInquiries";
import { useUpdateInquiryStatus } from "@/hooks/mutations/useUpdateInquiryStatus";
import type { Inquiry, InquiryStatus } from "@/hooks/queries/useInquiries";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { AdminErrorState } from "@/components/ui/AdminErrorState";
import { SkeletonTable } from "@/components/ui/Skeleton";

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: InquiryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

const SOURCE_LABELS: Record<Inquiry["source"], string> = {
  contact_form: "Contact Form",
  whatsapp: "WhatsApp",
  project_page: "Project Page",
};

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.round((date.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    const delta = diffSec / secondsInUnit;
    if (Math.abs(delta) >= 1 || unit === "second") {
      return rtf.format(Math.round(delta), unit);
    }
  }

  return rtf.format(0, "second");
}

function statusBadgeClass(status: InquiryStatus): string {
  switch (status) {
    case "new":
      return "bg-info-light text-info";
    case "contacted":
      return "bg-warning-light text-warning";
    case "closed":
      return "bg-success-light text-success";
  }
}

export default function AdminInquiriesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } = useInquiries({
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
  });

  const { data: newStats } = useInquiries({
    page: 1,
    limit: 1,
    status: "new",
  });
  const { data: contactedStats } = useInquiries({
    page: 1,
    limit: 1,
    status: "contacted",
  });
  const { data: closedStats } = useInquiries({
    page: 1,
    limit: 1,
    status: "closed",
  });

  const updateStatus = useUpdateInquiryStatus();

  const inquiries = data?.inquiries ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleStatusFilterChange(value: InquiryStatus | "") {
    setStatusFilter(value);
    setPage(1);
    setExpandedId(null);
  }

  function handleStatusChange(inquiry: Inquiry, status: InquiryStatus) {
    if (inquiry.status === status) return;

    updateStatus.mutate({ id: inquiry.id, status });
  }

  function toggleExpanded(id: number) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
          Inquiries
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Review and manage customer inquiries
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-text-muted">New</p>
          <p className="mt-1 font-heading text-3xl font-bold text-info">
            {newStats?.total ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-text-muted">Contacted</p>
          <p className="mt-1 font-heading text-3xl font-bold text-warning">
            {contactedStats?.total ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-text-muted">Closed</p>
          <p className="mt-1 font-heading text-3xl font-bold text-success">
            {closedStats?.total ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="status-filter" className="text-sm font-medium text-primary">
          Filter:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(event) =>
            handleStatusFilterChange(event.target.value as InquiryStatus | "")
          }
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : isError ? (
          <AdminErrorState
            message={error?.message}
            onRetry={() => void refetch()}
          />
        ) : !inquiries.length ? (
          <AdminEmptyState
            icon={MessageSquare}
            title="No inquiries found"
            description={
              statusFilter
                ? `No ${statusFilter} inquiries to show.`
                : "Inquiries from contact forms and project pages will appear here."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-light text-text-muted">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium" aria-label="Expand" />
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => {
                    const isExpanded = expandedId === inquiry.id;

                    return (
                      <Fragment key={inquiry.id}>
                        <tr className="border-b border-border-light hover:bg-surface/50">
                          <td className="px-4 py-3 font-medium text-primary">
                            {inquiry.name}
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {inquiry.phone ?? inquiry.email ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-text-muted">
                            {SOURCE_LABELS[inquiry.source]}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={inquiry.status}
                              disabled={updateStatus.isPending}
                              onChange={(event) =>
                                handleStatusChange(
                                  inquiry,
                                  event.target.value as InquiryStatus,
                                )
                              }
                              className={`rounded-lg border-0 px-2 py-1 text-xs font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-accent ${statusBadgeClass(inquiry.status)}`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td
                            className="px-4 py-3 text-text-muted"
                            title={new Date(inquiry.createdAt).toLocaleString()}
                          >
                            {formatRelativeDate(inquiry.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(inquiry.id)}
                              className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-primary"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded ? "Collapse details" : "Expand details"
                              }
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="border-b border-border-light bg-surface/30">
                            <td colSpan={6} className="px-4 py-4">
                              <dl className="grid gap-3 sm:grid-cols-2">
                                {inquiry.email ? (
                                  <div>
                                    <dt className="text-xs font-medium text-text-light">
                                      Email
                                    </dt>
                                    <dd className="mt-0.5 text-sm text-text">
                                      {inquiry.email}
                                    </dd>
                                  </div>
                                ) : null}
                                {inquiry.phone ? (
                                  <div>
                                    <dt className="text-xs font-medium text-text-light">
                                      Phone
                                    </dt>
                                    <dd className="mt-0.5 text-sm text-text">
                                      {inquiry.phone}
                                    </dd>
                                  </div>
                                ) : null}
                                {inquiry.projectTitle ? (
                                  <div>
                                    <dt className="text-xs font-medium text-text-light">
                                      Project
                                    </dt>
                                    <dd className="mt-0.5 text-sm text-text">
                                      {inquiry.projectTitle}
                                    </dd>
                                  </div>
                                ) : null}
                                {inquiry.message ? (
                                  <div className="sm:col-span-2">
                                    <dt className="text-xs font-medium text-text-light">
                                      Message
                                    </dt>
                                    <dd className="mt-0.5 whitespace-pre-wrap text-sm text-text">
                                      {inquiry.message}
                                    </dd>
                                  </div>
                                ) : null}
                              </dl>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border-light px-4 py-3">
              <p className="text-sm text-text-muted">
                {total} {total === 1 ? "inquiry" : "inquiries"}
                {statusFilter ? ` (${statusFilter})` : ""}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-border p-2 text-text-muted hover:bg-surface disabled:opacity-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
