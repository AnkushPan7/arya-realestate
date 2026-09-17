/**
 * Thin, DB-aware wrappers around the JSON-LD builders in `@/lib/seo`.
 * Keeps a single source of truth for schema shapes while letting pages
 * pass live `site_settings` / `offices` / `projects` / `blog_posts` rows.
 */
import type { PublicOffice } from "@/lib/public-data";
import type { SampleBlogPost } from "@/lib/sample-blog";
import type { SampleProject } from "@/lib/sample-projects";
import {
  type BreadcrumbItem,
  type JsonLdValue,
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProjectJsonLd,
} from "@/lib/seo";
import { SITE_NAME, getSiteUrl } from "@/lib/site";

type SiteSettingsLike = {
  companyName?: string | null;
  email?: string | null;
  whatsappNumber?: string | null;
} | null;

/** Organization schema, preferring live `site_settings` + `offices` when available. */
export function organizationSchema(
  settings?: SiteSettingsLike,
  offices?: PublicOffice[],
): JsonLdValue {
  const sameAs = offices?.length
    ? offices.flatMap((office) => office.socialLinks.map((link) => link.url))
    : undefined;

  return buildOrganizationJsonLd({
    name: settings?.companyName ?? undefined,
    email: settings?.email ?? undefined,
    telephone: settings?.whatsappNumber ?? undefined,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
    addresses: offices?.length
      ? offices.map((office) => ({
          streetAddress: office.address,
          addressLocality: office.city,
          addressRegion: office.state,
          postalCode: office.pincode,
          addressCountry: "IN",
        }))
      : undefined,
  });
}

/** LocalBusiness schema for a single office (used on the contact page). */
export function localBusinessSchema(office: PublicOffice): JsonLdValue {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteUrl}/#office-${office.id}`,
    name: `${SITE_NAME} — ${office.name}`,
    parentOrganization: { "@id": `${siteUrl}/#organization` },
    address: {
      "@type": "PostalAddress",
      streetAddress: office.address,
      addressLocality: office.city,
      addressRegion: office.state,
      ...(office.pincode ? { postalCode: office.pincode } : {}),
      addressCountry: "IN",
    },
    ...(office.phoneNumbers?.[0] ? { telephone: office.phoneNumbers[0] } : {}),
    ...(office.email ? { email: office.email } : {}),
    ...(office.googleMapsUrl ? { hasMap: office.googleMapsUrl } : {}),
    ...(office.latitude && office.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: office.latitude,
            longitude: office.longitude,
          },
        }
      : {}),
  };
}

/** RealEstateListing schema for a project detail page. */
export function realEstateListingSchema(
  project: SampleProject,
  zone: "east" | "west",
): JsonLdValue {
  const description =
    project.description?.[0] ??
    `${project.title} in ${project.location}. ${project.displayPrice}.`;

  return buildProjectJsonLd({
    title: project.title,
    description,
    path: `/projects/${zone}/${project.slug}`,
    location: project.location,
    zone,
    status: project.status,
    propertyType: project.propertyType,
    displayPrice: project.displayPrice,
    imageUrl: project.primaryImageUrl,
    reraNumber: project.reraNumber,
  });
}

/** BlogPosting schema for a blog article page. */
export function blogPostingSchema(post: SampleBlogPost): JsonLdValue {
  return buildBlogPostingJsonLd({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    publishedAt: post.publishedAt,
    author: post.author,
    imageUrl: post.coverImageUrl,
  });
}

/** BreadcrumbList schema — re-exported for a single import surface. */
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdValue {
  return buildBreadcrumbJsonLd(items);
}
