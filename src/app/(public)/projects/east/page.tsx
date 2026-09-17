import type { Metadata } from "next";
import {
  ProjectsListing,
  parseListingSearchParams,
  type SearchParams,
} from "@/components/public/ProjectsListing";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "East Ahmedabad Projects";
const DESCRIPTION =
  "Explore ongoing, upcoming, and completed projects in East Ahmedabad with Arya Real Estate — Nikol, Naroda, Odhav, and more.";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/projects/east",
    keywords: [
      "East Ahmedabad projects",
      "Nikol flats",
      "Naroda apartments",
      "Odhav commercial",
    ],
  });
}

export default async function EastProjectsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { status, type } = parseListingSearchParams(searchParams);

  return (
    <ProjectsListing
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "East" },
      ]}
      path="/projects/east"
      headline="East Ahmedabad Projects"
      subtitle="Homes and commercial spaces across Nikol, Naroda, Odhav, and the growing eastern corridors of Ahmedabad."
      fixedZone="east"
      status={status}
      type={type}
      resetHref="/projects/east"
    />
  );
}
