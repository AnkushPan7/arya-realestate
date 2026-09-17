/**
 * Generate URL-safe slug from a string.
 * "Aaradhana Sky 2" → "aaradhana-sky-2"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format price in Indian Rupees with lakh/crore notation.
 */
export function formatPrice(price: number): string {
  if (price >= 10_000_000) {
    return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  }
  if (price >= 100_000) {
    return `₹${(price / 100_000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Estimate reading time from markdown/text content.
 */
export function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Construct Supabase Storage public URL.
 * Prefer getPublicStorageUrl() from @/lib/supabase when using SUPABASE_BUCKET_NAME.
 */
export function getStorageUrl(bucket: string, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be set");
  }
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
