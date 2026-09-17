import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Global 404 — standalone (root layout only, no public Header/Footer).
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-16">
      <svg
        width="120"
        height="120"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-8"
      >
        {/* Foundation */}
        <line
          x1="16"
          y1="60"
          x2="64"
          y2="60"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />

        {/* Left wall — unbroken */}
        <line
          x1="16"
          y1="60"
          x2="16"
          y2="36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />

        {/* Right wall — cracked (gap in the middle) */}
        <line
          x1="64"
          y1="60"
          x2="64"
          y2="50"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <line
          x1="64"
          y1="46"
          x2="64"
          y2="36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        {/* Small diagonal nick to sell the break */}
        <line
          x1="61"
          y1="49"
          x2="66"
          y2="47"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="square"
          opacity="0.85"
        />

        {/* Roof */}
        <polyline
          points="16,36 40,16 64,36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />

        {/* Door */}
        <rect
          x="35"
          y="44"
          width="10"
          height="16"
          stroke="var(--color-accent)"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <h1 className="font-heading text-7xl font-bold tracking-tight text-primary md:text-8xl">
        404
      </h1>
      <p className="mt-2 text-xl text-text-muted">
        This property doesn&apos;t exist
      </p>
      <p className="mt-1 max-w-md text-center text-sm text-text-muted">
        The page you&apos;re looking for has been moved, demolished, or never
        built.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light"
        >
          Back to Home
        </Link>
        <Link
          href="/projects"
          className="rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-text-inverse"
        >
          View Projects
        </Link>
      </div>
    </div>
  );
}
