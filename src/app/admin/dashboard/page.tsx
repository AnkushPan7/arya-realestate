"use client";

import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import { SkeletonCard } from "@/components/ui/Skeleton";

const CARDS = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: Building2,
  },
  {
    key: "ongoingProjects" as const,
    label: "Ongoing Projects",
    icon: TrendingUp,
  },
  {
    key: "newInquiries" as const,
    label: "Total Inquiries (new)",
    icon: MessageSquare,
  },
  {
    key: "blogPosts" as const,
    label: "Blog Posts",
    icon: FileText,
  },
];

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-primary">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Overview of your content and inquiries
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} className="h-28" />
            ))
          : CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="rounded-xl bg-card p-5 shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm text-text-muted">{card.label}</p>
                  <p className="mt-1 font-heading text-2xl font-bold text-primary">
                    {data?.[card.key] ?? 0}
                  </p>
                </div>
              );
            })}
      </div>
    </div>
  );
}
