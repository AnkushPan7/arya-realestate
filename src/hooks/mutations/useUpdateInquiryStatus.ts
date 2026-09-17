"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { inquiryKeys } from "@/hooks/keys";
import type { Inquiry, InquiryStatus } from "@/hooks/queries/useInquiries";

export type UpdateInquiryStatusInput = {
  id: number;
  status: InquiryStatus;
};

type ApiResponse = {
  data?: Inquiry;
  error?: string;
};

async function updateInquiryStatus({
  id,
  status,
}: UpdateInquiryStatusInput): Promise<Inquiry> {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update inquiry");
  }

  return json.data;
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInquiryStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inquiryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update inquiry status");
    },
  });
}
