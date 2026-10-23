import type { EventItem } from "@/types";
import { sanitizeOrgSlugs } from "@/lib/organizations";
import { isKnownHbcu } from "@/lib/hbcus";
import { sanitizeMedia, DEFAULT_MEDIA } from "@/lib/media";
import { EVENT_BUCKET } from "@/lib/storage";

export function storagePrefix(): string | null {
  const base = process.env.SUPABASE_URL;
  return base ? `${base.replace(/\/$/, "")}/storage/v1/object/public/${EVENT_BUCKET}/` : null;
}

type Body = Record<string, unknown>;

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/**
 * Divine Nine fields + media fields from a request body. When `existing` is given (edits), fields
 * the client did not send keep their stored values.
 */
export function parseDivineNineFields(
  body: Body,
  existing?: EventItem
): { ok: true; fields: Partial<EventItem> } | { ok: false; error: string } {
  const fields: Partial<EventItem> = {};

  if ("organizations" in body) fields.organizations = sanitizeOrgSlugs(body.organizations);
  if ("school" in body) {
    fields.school = str(body.school, 160);
    if (!("isHbcu" in body)) fields.isHbcu = isKnownHbcu(fields.school);
  }
  if ("isHbcu" in body) fields.isHbcu = Boolean(body.isHbcu);
  if ("chapter" in body) fields.chapter = str(body.chapter, 160);

  const mediaKeys = ["mediaType", "mediaUrl", "posterUrl", "mediaAspect", "mediaFit", "mediaZoom", "mediaX", "mediaY", "mediaSize"];
  if (mediaKeys.some((k) => k in body)) {
    const base = existing ?? ({ ...DEFAULT_MEDIA } as Partial<EventItem>);
    const merged = {
      mediaType: base.mediaType,
      mediaUrl: base.mediaUrl,
      posterUrl: base.posterUrl,
      mediaAspect: base.mediaAspect,
      mediaFit: base.mediaFit,
      mediaZoom: base.mediaZoom,
      mediaX: base.mediaX,
      mediaY: base.mediaY,
      mediaSize: base.mediaSize,
      ...Object.fromEntries(mediaKeys.filter((k) => k in body).map((k) => [k, body[k]])),
    };
    const res = sanitizeMedia(merged, storagePrefix());
    if (!res.ok) return res;
    Object.assign(fields, res.media);
  }
  return { ok: true, fields };
}
