"use client";

import { useQuery } from "@tanstack/react-query";
import { inquiryKeys } from "@/hooks/keys";

type InquiriesResponse = {
  data?: unknown[];
  total?: number;
  error?: string;
};

async function fetchNewInquiryCount(): Promise<number> {
  const res = await fetch("/api/inquiries?status=new&page=1&limit=1");
  const json = (await res.json()) as InquiriesResponse;

  if (!res.ok) {
    throw new Error(json.error ?? "Unable to load inquiry count");
  }

  return json.total ?? 0;
}

export function useNewInquiryCount() {
  return useQuery({
    queryKey: inquiryKeys.newCount(),
    queryFn: fetchNewInquiryCount,
    staleTime: 0,
  });
}
