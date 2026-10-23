import crypto from "crypto";

export const EVENT_BUCKET = "divine-nine-events";

import { IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/storage-limits";

export { IMAGE_TYPES, VIDEO_TYPES, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES };

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

function supabaseUrl(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error("Storage is not configured (SUPABASE_URL missing).");
  return url.replace(/\/$/, "");
}

export function publicObjectUrl(path: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/${EVENT_BUCKET}/${path}`;
}

export function newObjectPath(contentType: string, folder: string): string {
  const ext = EXT[contentType] || "bin";
  const stamp = new Date().toISOString().slice(0, 7);
  return `${folder}/${stamp}/${crypto.randomBytes(10).toString("hex")}.${ext}`;
}

/** Ask Supabase Storage for a one-time signed upload URL (browser then uploads the file directly). */
export async function createSignedUpload(path: string): Promise<{ uploadUrl: string }> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Storage is not configured (service key missing).");
  const res = await fetch(`${supabaseUrl()}/storage/v1/object/upload/sign/${EVENT_BUCKET}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
    body: "{}",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.message || data.error || "Could not create upload URL.");
  }
  // data.url looks like /object/upload/sign/<bucket>/<path>?token=...
  return { uploadUrl: `${supabaseUrl()}/storage/v1${data.url}` };
}
