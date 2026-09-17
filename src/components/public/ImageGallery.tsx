"use client";

import Image from "next/image";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export type GalleryImage = {
  url: string | null;
  altText: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
  projectTitle: string;
};

export function ImageGallery({ images, projectTitle }: ImageGalleryProps) {
  const slides =
    images.length > 0
      ? images
      : [{ url: null, altText: `${projectTitle} placeholder` }];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, goPrev, goNext]);

  const active = slides[activeIndex] ?? slides[0];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative block aspect-[16/9] w-full overflow-hidden rounded-2xl bg-border text-left"
        aria-label={`View gallery for ${projectTitle}`}
      >
        {active.url ? (
          <Image
            src={active.url}
            alt={active.altText}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Building2 className="h-10 w-10 text-text-light" strokeWidth={1.5} />
            <span className="text-xs text-text-muted">Images Coming Soon</span>
          </div>
        )}
      </button>

      {slides.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, index) => (
            <button
              key={`${slide.altText}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                index === activeIndex
                  ? "border-accent"
                  : "border-transparent hover:border-accent/50"
              }`}
              aria-label={`Show image ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              {slide.url ? (
                <Image
                  src={slide.url}
                  alt={slide.altText}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-border">
                  <Building2 className="h-5 w-5 text-text-light" />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} gallery`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-2 text-text-inverse transition-colors hover:bg-text-inverse/10"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>

          {slides.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 rounded-full p-2 text-text-inverse transition-colors hover:bg-text-inverse/10 md:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 rounded-full p-2 text-text-inverse transition-colors hover:bg-text-inverse/10 md:right-8"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          ) : null}

          <div className="relative mx-4 aspect-[16/9] w-full max-w-5xl overflow-hidden rounded-2xl bg-border">
            {active.url ? (
              <Image
                src={active.url}
                alt={active.altText}
                fill
                sizes="100vw"
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Building2
                  className="h-12 w-12 text-text-light"
                  strokeWidth={1.5}
                />
                <span className="text-sm text-text-muted">
                  {active.altText || "Image placeholder"}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
