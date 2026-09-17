import Link from "next/link";
import { GeometricPattern } from "@/components/public/GeometricPattern";
import { whatsappHref } from "@/lib/site";

type CtaBandProps = {
  title: string;
  subtitle: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Prefer WhatsApp as secondary when env is set */
  preferWhatsAppSecondary?: boolean;
};

export function CtaBand({
  title,
  subtitle,
  primaryHref = "/contact",
  primaryLabel = "Get In Touch",
  secondaryHref = "/projects",
  secondaryLabel = "Explore Projects",
  preferWhatsAppSecondary = true,
}: CtaBandProps) {
  const wa = preferWhatsAppSecondary ? whatsappHref() : null;

  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      <GeometricPattern />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-text-inverse md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-lg text-text-inverse/70">{subtitle}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-accent-light"
          >
            {primaryLabel}
          </Link>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-text-inverse/30 px-8 py-3.5 text-sm font-semibold text-text-inverse transition-all duration-300 hover:bg-text-inverse/10"
            >
              WhatsApp Us
            </a>
          ) : (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-text-inverse/30 px-8 py-3.5 text-sm font-semibold text-text-inverse transition-all duration-300 hover:bg-text-inverse/10"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
