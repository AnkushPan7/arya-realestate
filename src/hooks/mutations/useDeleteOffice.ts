"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { officeKeys } from "@/hooks/keys";

type DeleteOfficeResponse = {
  data?: { id: number };
  error?: string;
};

async function deleteOffice(id: number): Promise<{ id: number }> {
  const res = await fetch(`/api/offices/${id}`, {
    method: "DELETE",
  });

  const json = (await res.json()) as DeleteOfficeResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to delete office");
  }

  return json.data;
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: officeKeys.all });
      toast.success("Office deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete office");
    },
  });
}
