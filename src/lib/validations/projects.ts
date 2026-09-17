import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Enter a valid URL").optional(),
);

const optionalNumeric = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}, z.coerce.number().nonnegative().nullable().optional());

export const zoneSchema = z.enum(["east", "west"]);
export const projectStatusSchema = z.enum(["upcoming", "ongoing", "completed"]);
export const propertyTypeSchema = z.enum([
  "apartment",
  "bungalow",
  "commercial",
  "industrial",
  "plot",
  "land",
]);
export const mediaTypeSchema = z.enum(["image", "video"]);

export const projectFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  zone: zoneSchema,
  status: projectStatusSchema.default("ongoing"),
  propertyType: propertyTypeSchema,
  bhkOptions: z.array(z.string().trim()).default([]),
  priceMin: optionalNumeric,
  priceMax: optionalNumeric,
  displayPrice: optionalString,
  location: z.string().trim().min(1, "Location is required"),
  address: optionalString,
  pincode: optionalString,
  plotArea: optionalString,
  areaUnit: optionalString,
  description: optionalString,
  features: z.array(z.string().trim()).default([]),
  reraNumber: optionalString,
  possessionDate: optionalString,
  videoUrl: optionalUrl,
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  metaTitle: optionalString,
  metaDescription: optionalString,
});

export const projectCreateSchema = projectFieldsSchema;

export const projectUpdateSchema = projectFieldsSchema.partial();

export const projectMediaInputSchema = z.object({
  url: z.string().trim().url("Enter a valid media URL"),
  mediaType: mediaTypeSchema.optional().default("image"),
  altText: optionalString,
  caption: optionalString,
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.number().int().optional().default(0),
});

export const projectMediaDeleteSchema = z.object({
  mediaId: z.number().int().positive(),
});

export const projectFloorPlanInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  displayOrder: z.number().int().optional().default(0),
});

export const projectFloorPlanDeleteSchema = z.object({
  floorPlanId: z.number().int().positive(),
});

export type ProjectInput = z.infer<typeof projectFieldsSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
