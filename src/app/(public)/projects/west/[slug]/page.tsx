import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProjectDetail,
  projectDetailMetadata,
} from "@/components/public/ProjectDetail";
import {
  getOfficesWithSocial,
  getProjectBySlugZone,
  getRelatedProjects,
  resolveOfficeForZone,
} from "@/lib/public-data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await props.params;
  return projectDetailMetadata(slug, "west");
}

export default async function WestProjectDetailPage(props: {
  params: Params;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlugZone(slug, "west");
  if (!project) notFound();

  const [related, offices] = await Promise.all([
    getRelatedProjects(slug, "west", 3),
    getOfficesWithSocial(),
  ]);
  const office = resolveOfficeForZone(offices, "west");

  return (
    <ProjectDetail project={project} related={related} zone="west" office={office} />
  );
}
