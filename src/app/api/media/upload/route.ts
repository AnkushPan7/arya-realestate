import { uploadToStorage } from "@/lib/supabase";
import {
  ensureAuth,
  isAuthFailure,
  jsonData,
  jsonError,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "upload";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_") || "upload";
}

export async function POST(request: Request) {
  const auth = await ensureAuth(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("File is required", 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("Only JPEG, PNG, WebP, and GIF images are allowed", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonError("File must be 5MB or smaller", 400);
    }

    const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
    const result = await uploadToStorage(file, path);

    return jsonData(result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload file";
    return jsonError(message, 500);
  }
}
