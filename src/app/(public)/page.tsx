import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Eye,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { CtaBand } from "@/components/public/CtaBand";
import { GeometricPattern } from "@/components/public/GeometricPattern";
import { GoogleReviews } from "@/components/public/GoogleReviews";
import { ProjectCard } from "@/components/public/ProjectCard";
import {
  getActiveHeroSlides,
  getFeaturedProjects,
  getOfficesWithSocial,
  getSiteSettings,
} from "@/lib/public-data";
import {
  SITE_DEFAULT_DESCRIPTION,
  buildPageMetadata,
  buildWebSiteJsonLd,
} from "@/lib/seo";
import { organizationSchema } from "@/lib/structured-data";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPageMetadata({
    title: `${settings?.companyName ?? SITE_NAME} | Trusted Property Consultancy in Ahmedabad`,
    description: settings?.metaDescription ?? SITE_DEFAULT_DESCRIPTION,
    path: "/",
    absoluteTitle: true,
    image: settings?.defaultOgImage,
    keywords: [
      "real estate Ahmedabad",
      "property consultancy Gujarat",
      "flats in Ahmedabad",
      "Arya Real Estate",
      "East Ahmedabad",
      "West Ahmedabad",
    ],
  });
}

const FEATURES = [
  {
    icon: Building2,
    title: "Full Spectrum",
    description:
      "Residential, commercial, and industrial properties under one trusted consultancy.",
  },
  {
    icon: MapPin,
    title: "East & West",
    description:
      "Deep local coverage across Ahmedabad’s growth corridors on both sides of the city.",
  },
  {
    icon: Users,
    title: "Personal Touch",
    description:
      "Dedicated guidance from first visit to handover — we stay with you throughout.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency",
    description:
      "Clear communication, documented details, and honest advice at every step.",
  },
] as const;

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "Relationships first. Our reputation is built on referrals from families we’ve helped.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "No hidden costs or surprises — you’ll always know exactly where things stand.",
  },
  {
    icon: TrendingUp,
    title: "Results",
    description:
      "2,200+ happy families and 1,500+ units sold since we opened our doors in 2012.",
  },
  {
    icon: HeartHandshake,
    title: "Service",
    description:
      "From shortlisting to paperwork, we make the journey simpler and more human.",
  },
] as const;

const HERO_STATS = [
  { value: "13+", label: "Years Experience" },
  { value: "2,200+", label: "Happy Families" },
  { value: "100+", label: "Projects" },
] as const;

export default async function HomePage() {
  const [heroSlides, featured, settings, offices] = await Promise.all([
    getActiveHeroSlides(),
    getFeaturedProjects(3),
    getSiteSettings(),
    getOfficesWithSocial(),
  ]);

  const heroSlide = heroSlides[0];

  return (
    <>
      <JsonLd data={organizationSchema(settings, offices)} />
      <JsonLd data={buildWebSiteJsonLd()} />

      <section className="relative flex min-h-screen items-center overflow-hidden bg-primary">
        {heroSlide ? (
          <>
            <Image
              src={heroSlide.imageUrl}
              alt={heroSlide.title ?? SITE_NAME}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-primary/70" aria-hidden />
          </>
        ) : null}
        <GeometricPattern />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                Ahmedabad&apos;s Trusted Consultancy
              </p>
              <h1 className="mt-5 font-heading text-5xl font-bold tracking-tight text-text-inverse md:text-6xl lg:text-7xl">
                {heroSlide?.title ? (
                  heroSlide.title
                ) : (
                  <>
                    We Help You Find The{" "}
                    <span className="text-accent">Right</span> Property
                  </>
                )}
              </h1>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-text-inverse/70 lg:mx-0">
                {heroSlide?.subtitle ??
                  "Premium residential and commercial opportunities across East and West Ahmedabad — guided with clarity since 2012."}
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href={heroSlide?.ctaLink ?? "/projects"}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-accent-light"
                >
                  {heroSlide?.ctaText ?? "Explore Projects"}
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-text-inverse/30 px-8 py-3.5 text-sm font-semibold text-text-inverse transition-all duration-300 hover:bg-text-inverse/10"
                >
                  Get In Touch
                </Link>
              </div>
            </div>

            <aside className="hidden w-72 shrink-0 lg:block">
              <div className="rounded-2xl border border-text-inverse/10 bg-white/5 p-8 backdrop-blur-md">
                {HERO_STATS.map((stat, i) => (
                  <div
                    key={stat.label}
                    className={
                      i < HERO_STATS.length - 1
                        ? "mb-6 border-b border-text-inverse/10 pb-6"
                        : ""
                    }
                  >
                    <p className="font-heading text-3xl font-bold text-accent">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-text-inverse/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <ChevronDown
            className="h-6 w-6 animate-bounce text-text-inverse/40"
            aria-hidden
          />
          <span className="sr-only">Scroll down</span>
        </div>
      </section>

      <section className="border-y border-border bg-card py-6">
        <p className="text-center text-sm text-text-muted">
          Trusted by 2,200+ families across Ahmedabad
        </p>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Who We Are
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
                Building Trust, Delivering Dreams
              </h2>
              <p className="mt-6 max-w-prose leading-relaxed text-text-muted">
                Established in 2012 by Harshad Prajapati and Sudhir Prajapati,
                Arya Real Estate has grown into one of Ahmedabad&apos;s most
                trusted consultancy firms. We offer a complete spectrum of
                property solutions — from premium commercial spaces to
                affordable homes — with local expertise on both sides of the city.
              </p>
              <p className="mt-4 max-w-prose leading-relaxed text-text-muted">
                Every recommendation is grounded in market knowledge, site
                visits, and a genuine interest in finding what fits your family.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-all duration-300 hover:underline"
              >
                Learn More →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-subtle text-accent">
                    <feature.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 font-heading font-semibold text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Our Projects
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Featured Properties
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-muted">
              Handpicked residential projects across East and West Ahmedabad.
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center text-center">
              <Building2
                className="h-10 w-10 text-text-light"
                strokeWidth={1.5}
              />
              <p className="mt-3 text-sm text-text-muted">
                Featured projects coming soon.
              </p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl border border-primary px-8 py-3.5 text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-text-inverse"
            >
              View All Projects →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Link
            href="/projects/east"
            className="group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-2xl bg-primary p-8 transition-all duration-300 md:p-12"
          >
            <GeometricPattern />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Zone
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-text-inverse md:text-4xl">
                East Ahmedabad
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-inverse/70">
                Growing corridors, strong connectivity, and homes built for
                families who want value without compromise.
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-accent transition-all duration-300 group-hover:underline">
                Explore East →
              </span>
            </div>
          </Link>

          <Link
            href="/projects/west"
            className="group relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-card-hover md:p-12"
          >
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Zone
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
                West Ahmedabad
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
                Premium addresses, lifestyle amenities, and landmark projects
                along the city’s western growth spine.
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-accent transition-all duration-300 group-hover:underline">
                Explore West →
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              What Guides Us
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Our Core Values
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border-t-2 border-accent bg-surface p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
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

      <GoogleReviews />

      <CtaBand
        title="Ready to Find Your Dream Home?"
        subtitle="Get in touch with our team for personalized property guidance across East and West Ahmedabad."
      />
    </>
  );
}
