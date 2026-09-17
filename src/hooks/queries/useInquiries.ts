"use client";

import { useQuery } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/keys";

export type InquiryStatus = "new" | "contacted" | "closed";

export type Inquiry = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: "contact_form" | "whatsapp" | "project_page";
  projectId: number | null;
  status: InquiryStatus;
  createdAt: string;
  projectTitle: string | null;
};

export type InquiriesResult = {
  inquiries: Inquiry[];
  total: number;
};

type InquiriesFilters = {
  page?: number;
  limit?: number;
  status?: InquiryStatus;
};

type InquiriesResponse = {
  data?: Inquiry[];
  total?: number;
  error?: string;
};

async function fetchInquiries(
  filters: InquiriesFilters,
): Promise<InquiriesResult> {
  const params = new URLSearchParams();

  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  const res = await fetch(`/api/inquiries${query ? `?${query}` : ""}`);
  const json = (await res.json()) as InquiriesResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to load inquiries");
  }

  return {
    inquiries: json.data,
    total: json.total ?? 0,
  };
}

export function useInquiries(filters: InquiriesFilters = {}) {
  return useQuery({
    queryKey: inquiryKeys.list(filters),
    queryFn: () => fetchInquiries(filters),
    staleTime: 0,
  });
}
