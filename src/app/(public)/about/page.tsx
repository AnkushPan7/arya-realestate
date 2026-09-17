import type { Metadata } from "next";
import Image from "next/image";
import {
  Eye,
  HeartHandshake,
  ShieldCheck,
  Target,
  Telescope,
  TrendingUp,
  User,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { CtaBand } from "@/components/public/CtaBand";
import { PageHero } from "@/components/public/PageHero";
import { getActiveTeamMembers, getPageContent } from "@/lib/public-data";
import { buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";
import { breadcrumbSchema, organizationSchema } from "@/lib/structured-data";

const PAGE_KEY = "about";

const DEFAULT_TITLE = "About Us";
const DEFAULT_DESCRIPTION =
  "Learn about Arya Real Estate — Ahmedabad's trusted property consultancy since 2012. Founded by Harshad and Sudhir Prajapati, we've helped 2,200+ families across East and West Ahmedabad find the right home.";

const DEFAULT_STORY_PARAGRAPHS = [
  "In 2012, brothers Harshad Prajapati and Sudhir Prajapati founded Arya Real Estate with a simple belief: every family in Ahmedabad deserves honest guidance when choosing a home. What began as a small consultancy — built on site visits, word-of-mouth, and late nights reviewing inventories — has grown into a trusted partner for buyers across the city.",
  "Today we work across East and West Ahmedabad, advising on more than 100 residential and commercial projects and celebrating 2,200+ happy families who found their space through Arya. Our scale has changed; our approach hasn't — deep local knowledge, transparent conversations, and support that lasts beyond the closing handshake.",
];

const STORY_STATS = [
  { value: "13+", label: "Years" },
  { value: "2,200+", label: "Families" },
  { value: "100+", label: "Projects" },
  { value: "50+", label: "Team Members" },
] as const;

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "Every recommendation is earned, not sold. Families return to us — and send their friends — because we put their long-term interest first.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Clear pricing, documented details, and honest comparisons. You always know where you stand before you decide.",
  },
  {
    icon: TrendingUp,
    title: "Results",
    description:
      "From shortlisting to handover, we measure success by closed deals that still feel right years later for the people who live in them.",
  },
  {
    icon: HeartHandshake,
    title: "Service",
    description:
      "Site visits, paperwork guidance, and follow-ups after possession — we stay involved so the journey feels personal, not transactional.",
  },
] as const;

const DEFAULT_TEAM = [
  { name: "Harshad Prajapati", role: "Co-Founder", photoUrl: null },
  { name: "Sudhir Prajapati", role: "Co-Founder", photoUrl: null },
  { name: "Priya Mehta", role: "Head of Sales", photoUrl: null },
  { name: "Ankit Shah", role: "Property Consultant", photoUrl: null },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent(PAGE_KEY);

  return buildPageMetadata({
    title: page?.metaTitle ?? page?.title ?? DEFAULT_TITLE,
    description: page?.metaDescription ?? DEFAULT_DESCRIPTION,
    path: "/about",
    keywords: [
      "about Arya Real Estate",
      "Harshad Prajapati",
      "Sudhir Prajapati",
      "property consultants Ahmedabad",
    ],
  });
}

export default async function AboutPage() {
  const [page, team] = await Promise.all([
    getPageContent(PAGE_KEY),
    getActiveTeamMembers(),
  ]);

  const storyParagraphs = page?.content
    ? page.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : DEFAULT_STORY_PARAGRAPHS;

  const teamMembers = team.length > 0 ? team : DEFAULT_TEAM;

  const title = page?.title ?? DEFAULT_TITLE;
  const description = page?.metaDescription ?? DEFAULT_DESCRIPTION;
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={organizationSchema()} />
      <JsonLd
        data={buildWebPageJsonLd({
          title,
          description,
          path: "/about",
          type: "AboutPage",
        })}
      />

      <PageHero
        breadcrumbs={breadcrumbs}
        title="Building Trust Since 2012"
        subtitle="A family-led consultancy helping Ahmedabad families find the right property with clarity, care, and local expertise."
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Our Story
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight text-primary md:text-3xl">
                From Vision to Ahmedabad&apos;s Most Trusted Consultancy
              </h2>
              {storyParagraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="mt-6 leading-relaxed text-text-muted first:mt-6"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {STORY_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-card p-6 text-center shadow-card"
                >
                  <p className="font-heading text-3xl font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl bg-primary p-8 md:p-10">
            <div className="inline-flex rounded-xl bg-white/10 p-2 text-accent">
              <Target className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-text-inverse">
              Our Mission
            </h2>
            <p className="mt-3 leading-relaxed text-text-inverse/70">
              To empower every family in Ahmedabad to find their ideal property
              through honest guidance and deep local expertise. We simplify
              decisions, surface the right options, and stay beside clients from
              first visit to final possession.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-surface p-8 md:p-10">
            <div className="inline-flex rounded-xl bg-accent-subtle p-2 text-accent">
              <Telescope className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-primary">
              Our Vision
            </h2>
            <p className="mt-3 leading-relaxed text-text-muted">
              To become Gujarat&apos;s most trusted name in real estate
              consultancy — known for integrity, market clarity, and outcomes
              that strengthen communities on both sides of Ahmedabad.
            </p>
          </article>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              What We Stand For
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Our Core Values
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border-t-2 border-accent bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                  <value.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-heading text-lg font-semibold text-primary">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              The People Behind Arya
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Our Team
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="overflow-hidden rounded-2xl bg-surface shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="relative aspect-square bg-border">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User
                        className="h-10 w-10 text-text-light"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-primary">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to Work With Us?"
        subtitle="Tell us what you're looking for — we'll help you find the right property with clarity and care."
      />
    </>
  );
}
