type GeometricPatternProps = {
  className?: string;
  /** Use primary-colored lines for light surfaces */
  tone?: "inverse" | "primary";
};

/**
 * Subtle diagonal line overlay for navy hero/CTA bands.
 */
export function GeometricPattern({
  className = "",
  tone = "inverse",
}: GeometricPatternProps) {
  const line =
    tone === "inverse"
      ? "color-mix(in srgb, var(--color-text-inverse) 3%, transparent)"
      : "color-mix(in srgb, var(--color-primary) 4%, transparent)";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          transparent,
          transparent 12px,
          ${line} 12px,
          ${line} 13px
        )`,
      }}
    />
  );
}
