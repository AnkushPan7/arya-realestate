/**
 * Single source of truth for public contact / office content.
 * Swap for DB fetches later without touching page layouts.
 */

export const SITE_NAME = "Arya Real Estate";

export const SITE_PHONE = "+91 99781 49329";
export const SITE_EMAIL = "ankushpanchal18@gmail.com";

export const OFFICES = [
  {
    id: "bopal",
    name: "Bopal Office",
    shortName: "Bopal Office",
    address: "467, Yash Meridian Complex, Bopal, Ahmedabad - 384001",
    addressShort: "467, Yash Meridian Complex, Bopal",
    phones: [SITE_PHONE],
    email: SITE_EMAIL,
  },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://facebook.com", label: "Facebook", platform: "facebook" },
  { href: "https://instagram.com", label: "Instagram", platform: "instagram" },
  { href: "https://youtube.com", label: "YouTube", platform: "youtube" },
  { href: "https://linkedin.com", label: "LinkedIn", platform: "linkedin" },
] as const;

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://aryarealestate.com"
  );
}

/** Digits-only WhatsApp number for wa.me links */
export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function whatsappHref(prefill?: string): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;
  if (!prefill) return `https://wa.me/${number}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(prefill)}`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}
