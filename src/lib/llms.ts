import {
  getOfficesWithSocial,
  getPublishedPosts,
  getProjectsFiltered,
  getSiteSettings,
} from "@/lib/public-data";
import { SITE_DEFAULT_DESCRIPTION } from "@/lib/seo";
import { OFFICES, SITE_EMAIL, SITE_NAME, SITE_PHONE, getSiteUrl } from "@/lib/site";

export async function buildLlmsTxt(): Promise<string> {
  const base = getSiteUrl();
  const [settings, offices] = await Promise.all([
    getSiteSettings(),
    getOfficesWithSocial(),
  ]);

  const siteName = settings?.companyName ?? SITE_NAME;
  const phone = settings?.whatsappNumber ?? SITE_PHONE;
  const email = settings?.email ?? SITE_EMAIL;
  const description = settings?.metaDescription ?? SITE_DEFAULT_DESCRIPTION;

  const officeLines =
    offices.length > 0
      ? offices
          .map((o) => `- ${o.name}: ${o.address} (${o.email ?? "—"})`)
          .join("\n")
      : OFFICES.map((o) => `- ${o.shortName}: ${o.address} (${o.email})`).join(
          "\n",
        );

  return `# ${siteName}

> ${description}

${siteName} is a property consultancy serving buyers across East and West Ahmedabad since 2012. Contact: ${phone} · ${email}

## Offices

${officeLines}

## Key pages

- [Home](${base}/): Company overview and featured projects
- [About](${base}/about): Story, mission, values, and team
- [Projects](${base}/projects): All residential and commercial listings
- [East Ahmedabad Projects](${base}/projects/east): East-zone inventory
- [West Ahmedabad Projects](${base}/projects/west): West-zone inventory
- [Blog](${base}/blog): Market updates, buying guides, project news
- [Contact](${base}/contact): Inquiry form and office details

## Optional

- Full site summary for AI agents: ${base}/llms-full.txt
- XML sitemap: ${base}/sitemap.xml
`.trim();
}

export async function buildLlmsFullTxt(): Promise<string> {
  const base = getSiteUrl();
  const [settings, offices, allProjects, allPosts] = await Promise.all([
    getSiteSettings(),
    getOfficesWithSocial(),
    getProjectsFiltered(),
    getPublishedPosts(),
  ]);

  const siteName = settings?.companyName ?? SITE_NAME;
  const phone = settings?.whatsappNumber ?? SITE_PHONE;
  const email = settings?.email ?? SITE_EMAIL;
  const description = settings?.metaDescription ?? SITE_DEFAULT_DESCRIPTION;

  const officeBlocks =
    offices.length > 0
      ? offices
          .map(
            (o) =>
              `### ${o.name}\n- Address: ${o.address}\n- Email: ${o.email ?? "—"}\n- Phone: ${(o.phoneNumbers ?? []).join(", ") || "—"}`,
          )
          .join("\n\n")
      : OFFICES.map(
          (o) =>
            `### ${o.shortName}\n- Address: ${o.address}\n- Email: ${o.email}\n- Phone: ${o.phones.join(", ")}`,
        ).join("\n\n");

  const projects = allProjects
    .map(
      (p) =>
        `- [${p.title}](${base}/projects/${p.zone}/${p.slug}): ${p.propertyType}, ${p.status}, ${p.location}, ${p.displayPrice}`,
    )
    .join("\n");

  const posts = allPosts
    .map(
      (p) =>
        `- [${p.title}](${base}/blog/${p.slug}): ${p.categoryLabel} — ${p.excerpt}`,
    )
    .join("\n");

  return `# ${siteName} — Full summary

> ${description}

## Company

- Name: ${siteName}
- Phone: ${phone}
- Email: ${email}
- Areas served: East Ahmedabad, West Ahmedabad
- Founded: 2012
- Focus: Residential and commercial property consultancy

## Offices

${officeBlocks}

## Projects (${allProjects.length})

${projects || "- No projects published yet."}

## Blog posts (${allPosts.length})

${posts || "- No articles published yet."}

## Primary URLs

- Home: ${base}/
- About: ${base}/about
- Projects: ${base}/projects
- Blog: ${base}/blog
- Contact: ${base}/contact
- Short AI map: ${base}/llms.txt
- Sitemap: ${base}/sitemap.xml
`.trim();
}
