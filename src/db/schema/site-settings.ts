import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull().default("Arya Real Estate"),
  logoUrl: text("logo_url"),
  tagline: text("tagline"),
  metaDescription: text("meta_description"),
  defaultOgImage: text("default_og_image"),
  whatsappNumber: text("whatsapp_number"),
  email: text("email"),
  googleReviewsPlaceId: text("google_reviews_place_id"),
  footerText: text("footer_text"),
  copyrightText: text("copyright_text"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
