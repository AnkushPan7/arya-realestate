import type { Metadata } from "next";
import {
  ProjectsListing,
  parseListingSearchParams,
  type SearchParams,
} from "@/components/public/ProjectsListing";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "West Ahmedabad Projects";
const DESCRIPTION =
  "Explore ongoing, upcoming, and completed projects in West Ahmedabad with Arya Real Estate — SG Highway, Bopal, and more.";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/projects/west",
    keywords: [
      "West Ahmedabad projects",
      "SG Highway apartments",
      "Bopal bungalows",
      "Memnagar property",
    ],
  });
}

export default async function WestProjectsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { status, type } = parseListingSearchParams(searchParams);

  return (
    <ProjectsListing
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "West" },
      ]}
      path="/projects/west"
      headline="West Ahmedabad Projects"
      subtitle="Premium addresses and lifestyle projects along SG Highway, Bopal, and West Ahmedabad’s growth spine."
      fixedZone="west"
      status={status}
      type={type}
      resetHref="/projects/west"
    />
  );
}
