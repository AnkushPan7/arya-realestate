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
  return projectDetailMetadata(slug, "east");
}

export default async function EastProjectDetailPage(props: {
  params: Params;
}) {
  const { slug } = await props.params;
  const project = await getProjectBySlugZone(slug, "east");
  if (!project) notFound();

  const [related, offices] = await Promise.all([
    getRelatedProjects(slug, "east", 3),
    getOfficesWithSocial(),
  ]);
  const office = resolveOfficeForZone(offices, "east");

  return (
    <ProjectDetail project={project} related={related} zone="east" office={office} />
  );
}
