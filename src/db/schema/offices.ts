import { pgTable, serial, text, timestamp, boolean, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const socialPlatformEnum = pgEnum("social_platform", [
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "google",
  "twitter",
]);

export const offices = pgTable("offices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull().default("Ahmedabad"),
  state: text("state").notNull().default("Gujarat"),
  pincode: text("pincode"),
  phoneNumbers: jsonb("phone_numbers").$type<string[]>().default([]),
  email: text("email"),
  googleMapsUrl: text("google_maps_url"),
  googleMapsEmbedUrl: text("google_maps_embed_url"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  officeId: integer("office_id").references(() => offices.id, { onDelete: "cascade" }),
  platform: socialPlatformEnum("platform").notNull(),
  url: text("url").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const officesRelations = relations(offices, ({ many }) => ({
  socialLinks: many(socialLinks),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  office: one(offices, {
    fields: [socialLinks.officeId],
    references: [offices.id],
  }),
}));
