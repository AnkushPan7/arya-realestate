import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().optional(),
);

const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().trim().email("Enter a valid email").optional(),
);

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.string().trim().url("Enter a valid URL").optional(),
);

export const socialPlatformSchema = z.enum([
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
  "google",
  "twitter",
]);

export const socialLinkInputSchema = z.object({
  platform: socialPlatformSchema,
  url: z.string().trim().url("Enter a valid social URL"),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const officeInputSchema = z.object({
  name: z.string().trim().min(1, "Office name is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1).default("Ahmedabad"),
  state: z.string().trim().min(1).default("Gujarat"),
  pincode: optionalString,
  phoneNumbers: z.array(z.string().trim()).default([]),
  email: optionalEmail,
  googleMapsUrl: optionalUrl,
  googleMapsEmbedUrl: optionalUrl,
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  socialLinks: z.array(socialLinkInputSchema).default([]),
});

export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkInputSchema>;
export type OfficeInput = z.infer<typeof officeInputSchema>;
