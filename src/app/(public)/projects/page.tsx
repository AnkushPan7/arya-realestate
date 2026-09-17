import type { Metadata } from "next";
import {
  ProjectsListing,
  parseListingSearchParams,
  type SearchParams,
} from "@/components/public/ProjectsListing";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "Projects | All Properties in Ahmedabad";
const DESCRIPTION =
  "Browse residential and commercial projects across East and West Ahmedabad with Arya Real Estate — apartments, bungalows, plots, and more.";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/projects",
    keywords: [
      "Ahmedabad projects",
      "flats in Ahmedabad",
      "apartments Ahmedabad",
      "Arya Real Estate projects",
    ],
  });
}

export default async function ProjectsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { status, type } = parseListingSearchParams(searchParams);

  return (
    <ProjectsListing
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Projects" },
      ]}
      path="/projects"
      headline="Our Projects"
      subtitle="Browse residential and commercial properties across East and West Ahmedabad — filter by status, type, and zone."
      status={status}
      type={type}
      resetHref="/projects"
    />
  );
}
