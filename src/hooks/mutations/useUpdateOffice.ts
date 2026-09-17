"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { officeKeys } from "@/hooks/keys";
import type { Office } from "@/hooks/queries/useOffices";
import type { OfficeInput } from "@/lib/validations/offices";

type UpdateOfficeVariables = {
  id: number;
  data: OfficeInput;
};

type OfficeResponse = {
  data?: Office;
  error?: string;
};

async function updateOffice({
  id,
  data,
}: UpdateOfficeVariables): Promise<Office> {
  const res = await fetch(`/api/offices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = (await res.json()) as OfficeResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to update office");
  }

  return json.data;
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOffice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.all });
      toast.success("Office updated");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update office");
    },
  });
}
