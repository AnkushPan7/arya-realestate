"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { officeKeys } from "@/hooks/keys";
import type { Office } from "@/hooks/queries/useOffices";
import type { OfficeInput } from "@/lib/validations/offices";

type OfficeResponse = {
  data?: Office;
  error?: string;
};

async function createOffice(input: OfficeInput): Promise<Office> {
  const res = await fetch("/api/offices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await res.json()) as OfficeResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to create office");
  }

  return json.data;
}

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.all });
      toast.success("Office created");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to create office");
    },
  });
}
