import type { MetadataRoute } from "next";
import { getSitemapPosts, getSitemapProjects } from "@/lib/public-data";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [projectRows, postRows] = await Promise.all([
    getSitemapProjects(),
    getSitemapPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/projects/east`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/projects/west`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projectRows.map((project) => ({
    url: `${base}/projects/${project.zone}/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const blogRoutes: MetadataRoute.Sitemap = postRows.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}
