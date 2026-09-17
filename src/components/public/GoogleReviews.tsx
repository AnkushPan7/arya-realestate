"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, User } from "lucide-react";
import { useGoogleReviews } from "@/hooks/queries/useGoogleReviews";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(rating)
              ? "fill-accent text-accent"
              : "fill-transparent text-border"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function GoogleReviews() {
  const { data: reviews = [], isLoading } = useGoogleReviews();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  if (isLoading || reviews.length === 0) return null;

  const active = reviews[activeIndex];

  function goPrev() {
    setActiveIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }

  function goNext() {
    setActiveIndex((i) => (i + 1) % reviews.length);
  }

  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Trusted By Our Clients
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
            What Families Say On Google
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-3xl">
          <Quote
            className="absolute -top-4 left-6 h-10 w-10 text-accent-subtle md:-left-4"
            strokeWidth={1.5}
            aria-hidden
          />

          <div className="rounded-2xl bg-surface p-8 shadow-card md:p-10">
            <StarRow rating={active.rating} />
            <p className="mt-5 leading-relaxed text-text-muted">
              &ldquo;{active.text}&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
              {active.profilePhotoUrl ? (
                <Image
                  src={active.profilePhotoUrl}
                  alt={active.authorName}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-subtle text-accent">
                  <User className="h-5 w-5" strokeWidth={1.75} />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-primary">
                  {active.authorName}
                </p>
                <p className="text-xs text-text-light">
                  {active.relativeTimeDescription} · Google Review
                </p>
              </div>
            </div>
          </div>

          {reviews.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous review"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((review, index) => (
                  <button
                    key={review.time}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show review ${index + 1}`}
                    aria-pressed={index === activeIndex}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-6 bg-accent"
                        : "w-2 bg-border hover:bg-accent/50"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label="Next review"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
