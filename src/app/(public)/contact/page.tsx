import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { InquiryForm } from "@/components/public/InquiryForm";
import { PageHero } from "@/components/public/PageHero";
import { getOfficesWithSocial, getSiteSettings } from "@/lib/public-data";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, localBusinessSchema } from "@/lib/structured-data";
import {
  OFFICES,
  SITE_EMAIL,
  SITE_PHONE,
  telHref,
  whatsappHref,
} from "@/lib/site";

const TITLE = "Contact Us";

export async function generateMetadata(): Promise<Metadata> {
  const offices = await getOfficesWithSocial();
  const officeSummary =
    offices.length > 0
      ? offices.map((o) => `${o.name}: ${o.address}`).join(". ")
      : `${OFFICES[0].name}: ${OFFICES[0].address}.`;

  const description = `Contact Arya Real Estate in Ahmedabad. ${officeSummary} Call ${SITE_PHONE} or visit our office.`;

  return buildPageMetadata({
    title: TITLE,
    description,
    path: "/contact",
    keywords: [
      "contact Arya Real Estate",
      "Bopal office",
      "Ahmedabad property consultants phone",
    ],
  });
}

export default async function ContactPage() {
  const [offices, settings] = await Promise.all([
    getOfficesWithSocial(),
    getSiteSettings(),
  ]);

  const phone = settings?.whatsappNumber ?? SITE_PHONE;
  const email = settings?.email ?? SITE_EMAIL;
  const wa = whatsappHref();
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Contact" },
  ];

  const displayOffices =
    offices.length > 0
      ? offices.map((office) => ({
          id: String(office.id),
          name: office.name,
          address: office.address,
          phoneNumbers: office.phoneNumbers ?? [],
          email: office.email,
          googleMapsEmbedUrl: office.googleMapsEmbedUrl,
        }))
      : OFFICES.map((office) => ({
          id: office.id,
          name: office.name,
          address: office.address,
          phoneNumbers: [...office.phones],
          email: office.email as string | null,
          googleMapsEmbedUrl: null as string | null,
        }));

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      {offices.map((office) => (
        <JsonLd key={office.id} data={localBusinessSchema(office)} />
      ))}

      <PageHero
        breadcrumbs={breadcrumbs}
        title="Get In Touch"
        subtitle="Visit us at our office or reach out directly — we're here to help you find the right property."
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <InquiryForm />
            </div>

            <div className="flex flex-col gap-6 lg:col-span-2">
              {displayOffices.map((office) => (
                <article
                  key={office.id}
                  className="rounded-2xl bg-card p-6 shadow-card"
                >
                  <h2 className="font-heading text-lg font-semibold text-primary">
                    {office.name}
                  </h2>

                  <p className="mt-3 flex gap-2 text-sm text-text-muted">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden
                    />
                    <span>{office.address}</span>
                  </p>

                  <div className="mt-3 space-y-2">
                    {(office.phoneNumbers ?? []).map((phoneNumber) => (
                      <a
                        key={phoneNumber}
                        href={telHref(phoneNumber)}
                        className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
                      >
                        <Phone
                          className="h-4 w-4 shrink-0 text-accent"
                          aria-hidden
                        />
                        {phoneNumber}
                      </a>
                    ))}
                  </div>

                  {office.email ? (
                    <a
                      href={`mailto:${office.email}`}
                      className="mt-3 flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
                    >
                      <Mail
                        className="h-4 w-4 shrink-0 text-accent"
                        aria-hidden
                      />
                      {office.email}
                    </a>
                  ) : null}

                  <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-border">
                    {office.googleMapsEmbedUrl ? (
                      <iframe
                        src={office.googleMapsEmbedUrl}
                        title={`Map to ${office.name}`}
                        className="h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="px-4 text-center text-xs text-text-muted">
                          Map will load from admin settings
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:px-6 md:gap-16 lg:px-8">
          <a
            href={telHref(phone)}
            className="flex items-center gap-3 text-sm text-text-muted transition-colors hover:text-accent"
          >
            <Phone className="h-5 w-5 text-accent" aria-hidden />
            {phone}
          </a>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 text-sm text-text-muted transition-colors hover:text-accent"
          >
            <Mail className="h-5 w-5 text-accent" aria-hidden />
            {email}
          </a>

          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-muted transition-colors hover:text-accent"
            >
              <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </section>
    </>
  );
}
