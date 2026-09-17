import type { Metadata } from "next";
import {
  OFFICES,
  SITE_EMAIL,
  SITE_NAME,
  SITE_PHONE,
  SOCIAL_LINKS,
  getSiteUrl,
} from "@/lib/site";

/** First value from Next.js async searchParams entries */
export function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type JsonLdPrimitive = string | number | boolean | null;

export type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export const DEFAULT_OG_LOCALE = "en_IN";

export const SITE_DEFAULT_DESCRIPTION =
  "Ahmedabad's trusted real estate consultancy since 2012. Premium residential and commercial properties across East and West Ahmedabad. 2,200+ happy families.";

/** Absolute URL for a site path (`/` → origin). */
export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Serialize JSON-LD safely for embedding in <script> */
export function serializeJsonLd(data: JsonLdValue): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLdScript({ data }: { data: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  /** Use absolute title (skip root template) — home page */
  absoluteTitle?: boolean;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
  noIndex?: boolean;
};

/**
 * Consistent public-page metadata: canonical, Open Graph, Twitter.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  keywords,
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImages = image
    ? [{ url: image.startsWith("http") ? image : absoluteUrl(image) }]
    : undefined;

  const openGraph =
    type === "article"
      ? {
          title,
          description,
          url,
          siteName: SITE_NAME,
          locale: DEFAULT_OG_LOCALE,
          type: "article" as const,
          ...(ogImages ? { images: ogImages } : {}),
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
          ...(authors?.length ? { authors } : {}),
        }
      : {
          title,
          description,
          url,
          siteName: SITE_NAME,
          locale: DEFAULT_OG_LOCALE,
          type: "website" as const,
          ...(ogImages ? { images: ogImages } : {}),
        };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: url,
    },
    openGraph,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImages ? { images: ogImages.map((i) => i.url) } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: absoluteUrl(item.href) }
        : {}),
    })),
  };
}

export type OrganizationJsonLdOverrides = {
  name?: string;
  telephone?: string;
  email?: string;
  sameAs?: string[];
  addresses?: {
    streetAddress: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string | null;
    addressCountry?: string;
  }[];
};

/**
 * Organization JSON-LD. Falls back to static `site.ts` constants; pass
 * `overrides` (typically sourced from `site_settings` + `offices` in the DB)
 * to prefer live content without duplicating this builder elsewhere.
 */
export function buildOrganizationJsonLd(
  overrides?: OrganizationJsonLdOverrides,
): JsonLdValue {
  const siteUrl = getSiteUrl();
  const addresses =
    overrides?.addresses && overrides.addresses.length > 0
      ? overrides.addresses
      : OFFICES.map((office) => ({
          streetAddress: office.address,
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          postalCode: null as string | null,
          addressCountry: "IN",
        }));

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#organization`,
    name: overrides?.name ?? SITE_NAME,
    url: siteUrl,
    telephone: overrides?.telephone ?? SITE_PHONE,
    email: overrides?.email ?? SITE_EMAIL,
    sameAs:
      overrides?.sameAs && overrides.sameAs.length > 0
        ? overrides.sameAs
        : SOCIAL_LINKS.map((link) => link.href),
    address: addresses.map((address) => ({
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality ?? "Ahmedabad",
      addressRegion: address.addressRegion ?? "Gujarat",
      ...(address.postalCode ? { postalCode: address.postalCode } : {}),
      addressCountry: address.addressCountry ?? "IN",
    })),
    areaServed: [
      {
        "@type": "City",
        name: "Ahmedabad",
      },
      "East Ahmedabad",
      "West Ahmedabad",
    ],
  };
}

export function buildWebSiteJsonLd(): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_DEFAULT_DESCRIPTION,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    inLanguage: "en-IN",
  };
}

export function buildWebPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
  type?: string;
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": input.type ?? "WebPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    about: { "@id": `${getSiteUrl()}/#organization` },
    inLanguage: "en-IN",
  };
}

export function buildContactPageJsonLd(description: string): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${SITE_NAME}`,
    description,
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "RealEstateAgent",
      name: SITE_NAME,
      telephone: SITE_PHONE,
      email: SITE_EMAIL,
      contactPoint: OFFICES.map((office) => ({
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: office.phones[0],
        email: office.email,
        areaServed: office.name,
        availableLanguage: ["en", "hi", "gu"],
      })),
    },
  };
}

export function buildCollectionPageJsonLd(input: {
  title: string;
  description: string;
  path: string;
  itemUrls: string[];
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.itemUrls.map((url, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url,
      })),
    },
  };
}

export function buildProjectJsonLd(input: {
  title: string;
  description: string;
  path: string;
  location: string;
  zone: "east" | "west";
  status: string;
  propertyType: string;
  displayPrice: string;
  imageUrl?: string | null;
  reraNumber?: string;
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability:
        input.status === "completed"
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      description: input.displayPrice,
    },
    about: {
      "@type": "Residence",
      name: input.title,
      description: input.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.location,
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
      ...(input.reraNumber
        ? { identifier: input.reraNumber }
        : {}),
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "zone",
          value: input.zone,
        },
        {
          "@type": "PropertyValue",
          name: "propertyType",
          value: input.propertyType,
        },
        {
          "@type": "PropertyValue",
          name: "status",
          value: input.status,
        },
      ],
    },
    seller: { "@id": `${getSiteUrl()}/#organization` },
  };
}

export function buildBlogPostingJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  author: string;
  imageUrl?: string | null;
}): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    author: {
      "@type": "Person",
      name: input.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      "@id": `${getSiteUrl()}/#organization`,
    },
    mainEntityOfPage: absoluteUrl(input.path),
    url: absoluteUrl(input.path),
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
    inLanguage: "en-IN",
  };
}
