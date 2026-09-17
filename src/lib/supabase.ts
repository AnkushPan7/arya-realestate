import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the Secret key (sb_secret_...)
 * or legacy service_role JWT. Used ONLY in API routes for Storage.
 * Never import this in client components.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for uploads. Use your Supabase secret key (sb_secret_...) as SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Public URL for an object in the configured storage bucket.
 */
export function getPublicStorageUrl(path: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_BUCKET_NAME;

  if (!url || !bucket) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_BUCKET_NAME must be set",
    );
  }

  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Upload a file to the public storage bucket (server-side only).
 */
export async function uploadToStorage(
  file: File,
  path: string,
): Promise<{ url: string; path: string }> {
  const bucket = process.env.SUPABASE_BUCKET_NAME;
  if (!bucket) {
    throw new Error("SUPABASE_BUCKET_NAME is not set");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { url: getPublicStorageUrl(path), path };
}
