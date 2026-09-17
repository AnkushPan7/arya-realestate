"use client";

import { useRouter } from "next/navigation";
import { BLOG_CATEGORIES } from "@/lib/sample-blog";

type CategoryOption = { value: string; label: string };

type BlogCategoryFiltersProps = {
  currentCategory?: string;
  categories?: CategoryOption[];
};

function pillClass(active: boolean) {
  return active
    ? "rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors"
    : "rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent";
}

export function BlogCategoryFilters({
  currentCategory = "all",
  categories,
}: BlogCategoryFiltersProps) {
  const router = useRouter();
  const options = categories ?? BLOG_CATEGORIES;

  function setCategory(category: string) {
    if (category === "all") {
      router.push("/blog");
      return;
    }
    router.push(`/blog?category=${category}`);
  }

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Blog categories"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={pillClass(currentCategory === option.value)}
          onClick={() => setCategory(option.value)}
          aria-pressed={currentCategory === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
