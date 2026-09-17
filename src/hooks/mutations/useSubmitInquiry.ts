"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inquiryKeys } from "@/hooks/keys";

export type SubmitInquiryInput = {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source?: "contact_form" | "whatsapp" | "project_page";
  projectId?: number;
};

type SubmitInquiryResponse = {
  data?: { id: number };
  error?: string;
};

async function submitInquiry(input: SubmitInquiryInput): Promise<{ id: number }> {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "contact_form",
      ...input,
    }),
  });

  const json = (await res.json()) as SubmitInquiryResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to submit inquiry");
  }

  return json.data;
}

export function useSubmitInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitInquiry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });
}
