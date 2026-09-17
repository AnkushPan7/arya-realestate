import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const zoneEnum = pgEnum("zone", ["east", "west"]);

export const projectStatusEnum = pgEnum("project_status", [
  "upcoming",
  "ongoing",
  "completed",
]);

export const propertyTypeEnum = pgEnum("property_type", [
  "apartment",
  "bungalow",
  "commercial",
  "industrial",
  "plot",
  "land",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  zone: zoneEnum("zone").notNull(),
  status: projectStatusEnum("status").notNull().default("ongoing"),
  propertyType: propertyTypeEnum("property_type").notNull(),
  bhkOptions: jsonb("bhk_options").$type<string[]>().default([]),
  priceMin: numeric("price_min", { precision: 14, scale: 2 }),
  priceMax: numeric("price_max", { precision: 14, scale: 2 }),
  displayPrice: text("display_price"),
  location: text("location").notNull(),
  address: text("address"),
  pincode: text("pincode"),
  plotArea: text("plot_area"),
  areaUnit: text("area_unit").default("sq.yards"),
  description: text("description"),
  features: jsonb("features").$type<string[]>().default([]),
  reraNumber: text("rera_number"),
  possessionDate: text("possession_date"),
  videoUrl: text("video_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectMedia = pgTable("project_media", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  mediaType: mediaTypeEnum("media_type").notNull().default("image"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  altText: text("alt_text"),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectFloorPlans = pgTable("project_floor_plans", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* Relations */
export const projectsRelations = relations(projects, ({ many }) => ({
  media: many(projectMedia),
  floorPlans: many(projectFloorPlans),
}));

export const projectMediaRelations = relations(projectMedia, ({ one }) => ({
  project: one(projects, {
    fields: [projectMedia.projectId],
    references: [projects.id],
  }),
}));

export const projectFloorPlansRelations = relations(projectFloorPlans, ({ one }) => ({
  project: one(projects, {
    fields: [projectFloorPlans.projectId],
    references: [projects.id],
  }),
}));
