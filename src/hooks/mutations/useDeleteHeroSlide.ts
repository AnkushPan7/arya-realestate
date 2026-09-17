"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { heroSlideKeys } from "@/hooks/keys";

type DeleteHeroSlideInput = {
  id: number;
};

type ApiResponse = {
  data?: { id: number };
  error?: string;
};

async function deleteHeroSlide({
  id,
}: DeleteHeroSlideInput): Promise<{ id: number }> {
  const res = await fetch(`/api/hero-slides/${id}`, {
    method: "DELETE",
  });

  const json = (await res.json()) as ApiResponse;

  if (!res.ok || !json.data) {
    throw new Error(json.error ?? "Unable to delete hero slide");
  }

  return json.data;
}

export function useDeleteHeroSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHeroSlide,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: heroSlideKeys.all });
      toast.success("Hero slide deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete hero slide");
    },
  });
}
