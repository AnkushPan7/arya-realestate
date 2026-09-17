"use client";

/**
 * Minimal line-art house loader — draws foundation → walls → roof → door,
 * then breathes while waiting. Pure CSS, no animation libraries.
 */

export function HouseLoader() {
  return (
    <div
      className="house-loader flex flex-col items-center gap-4"
      role="status"
      aria-live="polite"
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="house-loader-svg"
      >
        {/* Foundation — left → right */}
        <line
          className="house-part house-foundation"
          x1="16"
          y1="60"
          x2="64"
          y2="60"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />

        {/* Walls — draw upward together */}
        <line
          className="house-part house-wall-left"
          x1="16"
          y1="60"
          x2="16"
          y2="36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <line
          className="house-part house-wall-right"
          x1="64"
          y1="60"
          x2="64"
          y2="36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />

        {/* Roof — left slope then right to peak (polyline drawn as two segments) */}
        <line
          className="house-part house-roof-left"
          x1="16"
          y1="36"
          x2="40"
          y2="16"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <line
          className="house-part house-roof-right"
          x1="40"
          y1="16"
          x2="64"
          y2="36"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="square"
        />

        {/* Door */}
        <rect
          className="house-door"
          x="35"
          y="44"
          width="10"
          height="16"
          stroke="var(--color-accent)"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <p className="house-loader-text text-sm font-body text-text-muted">
        Finding your space...
      </p>

      <style>{`
        .house-loader-svg {
          overflow: visible;
        }

        .house-foundation {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: house-draw 0.4s ease forwards;
        }

        .house-wall-left,
        .house-wall-right {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: house-draw 0.4s ease 0.35s forwards;
        }

        .house-roof-left {
          stroke-dasharray: 32;
          stroke-dashoffset: 32;
          animation: house-draw 0.35s ease 0.75s forwards;
        }

        .house-roof-right {
          stroke-dasharray: 32;
          stroke-dashoffset: 32;
          animation: house-draw 0.35s ease 0.95s forwards;
        }

        .house-door {
          opacity: 0;
          animation: house-door-in 0.3s ease 1.35s forwards;
        }

        .house-loader-svg {
          animation: house-breathe 2s ease-in-out 1.8s infinite;
        }

        .house-loader-text {
          animation: house-text-pulse 2s ease-in-out infinite;
        }

        @keyframes house-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes house-door-in {
          to {
            opacity: 1;
          }
        }

        @keyframes house-breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        @keyframes house-text-pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .house-part,
          .house-door,
          .house-loader-svg,
          .house-loader-text {
            animation: none !important;
          }

          .house-part {
            stroke-dashoffset: 0;
          }

          .house-door {
            opacity: 1;
          }

          .house-loader-text {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface">
      <HouseLoader />
    </div>
  );
}
