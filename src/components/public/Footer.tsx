import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SVGProps } from "react";
import { getOfficesWithSocial, getSiteSettings } from "@/lib/public-data";
import {
  OFFICES,
  SITE_EMAIL,
  SITE_NAME,
  SOCIAL_LINKS,
  telHref,
} from "@/lib/site";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

function IconFacebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M14 8.5V11h2.5l-.4 3H14v7h-3.2v-7H8.5v-3H10.8V8.2c0-2.1 1.3-3.7 3.7-3.7H16.5v3h-1.4c-.7 0-.9.3-.9 1z" />
    </svg>
  );
}

function IconInstagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
      {...props}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M22.5 7.2a3 3 0 0 0-2.1-2.1C18.6 4.6 12 4.6 12 4.6s-6.6 0-8.4.5A3 3 0 0 0 1.5 7.2 31.4 31.4 0 0 0 1 12a31.4 31.4 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.8.5 8.4.5 8.4.5s6.6 0 8.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 23 12a31.4 31.4 0 0 0-.5-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
    </svg>
  );
}

function IconLinkedin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.3 9.2H3.4V20.5h2.9V9.2zM4.85 4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20.6 13.3c0-3.1-1.7-4.5-3.9-4.5-1.8 0-2.6 1-3.1 1.7V9.2H10.8c0 .6 0 11.3 0 11.3h2.9v-6.3c0-.3 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.6v6.2h2.9v-6.4z" />
    </svg>
  );
}

function IconX(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.5 3.5h2.7l-5.9 6.7L22 20.5h-5.8l-4.5-5.9-5.2 5.9H3.8l6.3-7.2L2 3.5h6l4.1 5.4 5.4-5.4zm-1 15.3h1.5L7.6 5.1H6L16.5 18.8z" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  facebook: IconFacebook,
  instagram: IconInstagram,
  youtube: IconYoutube,
  linkedin: IconLinkedin,
  twitter: IconX,
} as const;

function FooterLogo() {
  return (
    <Link href="/">
      <Image
        src="/arya-logo-white.png"
        alt="Arya Real Estate"
        height={44}
        width={120}
        className="h-11 w-auto object-contain"
        unoptimized
      />
    </Link>
  );
}

export async function Footer() {
  const [offices, settings] = await Promise.all([
    getOfficesWithSocial(),
    getSiteSettings(),
  ]);

  const companyName = settings?.companyName ?? SITE_NAME;
  const copyrightText =
    settings?.copyrightText ??
    `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  const companyEmail = settings?.email ?? SITE_EMAIL;

  const displayOffices =
    offices.length > 0
      ? offices.map((office) => ({
          id: String(office.id),
          name: office.name,
          addressShort: office.address,
          phones: office.phoneNumbers ?? [],
          email: office.email ?? companyEmail,
        }))
      : OFFICES.map((office) => ({
          id: office.id,
          name: office.name,
          addressShort: office.addressShort,
          phones: [...office.phones],
          email: office.email,
        }));

  const socialLinks =
    offices.length > 0
      ? Array.from(
          new Map(
            offices
              .flatMap((office) => office.socialLinks)
              .filter((link) => link.platform in SOCIAL_ICONS)
              .map((link) => [link.platform, link]),
          ).values(),
        )
      : SOCIAL_LINKS.map((link) => ({
          platform: link.platform as keyof typeof SOCIAL_ICONS,
          url: link.href,
          label: link.label,
        }));

  return (
    <footer className="bg-primary text-text-inverse">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <FooterLogo />
            <p className="mt-4 text-sm font-medium text-accent">
              Trusted property consultancy since 2012
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-inverse/60">
              {settings?.tagline ??
                "Helping families across Ahmedabad find homes with clarity, care, and local expertise in East & West zones."}
            </p>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight text-text-inverse">
              Quick Links
            </h2>
            <ul className="mt-5 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-inverse/60 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight text-text-inverse">
              Our Office
            </h2>
            <ul className="mt-5 space-y-6">
              {displayOffices.map((office) => (
                <li key={office.id} className="space-y-2">
                  <p className="text-sm font-medium text-text-inverse">
                    {office.name}
                  </p>
                  <p className="flex items-start gap-2 text-sm text-text-inverse/60">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden
                    />
                    <span>{office.addressShort}</span>
                  </p>
                  {office.phones.map((phone) => (
                    <a
                      key={phone}
                      href={telHref(phone)}
                      className="flex items-center gap-2 text-sm text-text-inverse/60 transition-colors hover:text-accent"
                    >
                      <Phone
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {phone}
                    </a>
                  ))}
                  {office.email ? (
                    <a
                      href={`mailto:${office.email}`}
                      className="flex items-center gap-2 text-sm text-text-inverse/60 transition-colors hover:text-accent"
                    >
                      <Mail
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {office.email}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight text-text-inverse">
              Connect With Us
            </h2>
            <div className="mt-5 grid max-w-26 grid-cols-2 gap-3">
              {socialLinks.map((link) => {
                const Icon = SOCIAL_ICONS[link.platform as keyof typeof SOCIAL_ICONS];
                if (!Icon) return null;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-text-inverse/10 text-text-inverse transition-colors hover:bg-accent hover:text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-text-inverse/10 py-6">
        <p className="text-center text-xs text-text-inverse/40">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}
