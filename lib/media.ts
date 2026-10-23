import type { EventMediaSettings, MediaAspect, MediaFit, MediaSize, MediaType } from "@/types";

export const ASPECTS: { value: MediaAspect; label: string; hint: string; ratio: number | null }[] = [
  { value: "original", label: "Original", hint: "Keep the whole picture", ratio: null },
  { value: "16:9", label: "Wide 16:9", hint: "Banner / video", ratio: 16 / 9 },
  { value: "4:5", label: "Flyer 4:5", hint: "Portrait flyer", ratio: 4 / 5 },
  { value: "1:1", label: "Square 1:1", hint: "Social post", ratio: 1 },
  { value: "9:16", label: "Story 9:16", hint: "Tall / reels", ratio: 9 / 16 },
];

export const SIZES: { value: MediaSize; label: string; className: string }[] = [
  { value: "sm", label: "Small", className: "max-w-sm" },
  { value: "md", label: "Medium", className: "max-w-xl" },
  { value: "lg", label: "Large", className: "max-w-3xl" },
  { value: "full", label: "Full width", className: "max-w-none" },
];

export function aspectRatioCss(aspect: MediaAspect): string | undefined {
  const a = ASPECTS.find((x) => x.value === aspect);
  if (!a || !a.ratio) return undefined;
  return aspect.replace(":", " / ");
}

export const DEFAULT_MEDIA: EventMediaSettings = {
  mediaType: "image",
  mediaUrl: null,
  posterUrl: null,
  mediaAspect: "original",
  mediaFit: "cover",
  mediaZoom: 1,
  mediaX: 50,
  mediaY: 50,
  mediaSize: "full",
};

export type ParsedVideo =
  | { provider: "youtube"; id: string; embedUrl: string; thumbnail: string }
  | { provider: "vimeo"; id: string; embedUrl: string; thumbnail: null }
  | { provider: "file"; url: string; thumbnail: null };

/** Understand a pasted video link: YouTube, Vimeo, or a direct video file (.mp4/.webm/.mov). */
export function parseVideoUrl(raw: string): ParsedVideo | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");

  let ytId: string | null = null;
  if (host === "youtu.be") ytId = u.pathname.slice(1).split("/")[0];
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") ytId = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?]+)/);
      if (m) ytId = m[2];
    }
  }
  if (ytId && /^[A-Za-z0-9_-]{6,15}$/.test(ytId)) {
    return {
      provider: "youtube",
      id: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{5,})/);
    if (m) {
      return { provider: "vimeo", id: m[1], embedUrl: `https://player.vimeo.com/video/${m[1]}`, thumbnail: null };
    }
  }

  if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) {
    return { provider: "file", url: u.toString(), thumbnail: null };
  }
  return null;
}

const ASPECT_VALUES = ASPECTS.map((a) => a.value);
const SIZE_VALUES: MediaSize[] = ["sm", "md", "lg", "full"];

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

/**
 * Validate media settings coming from a client. `storagePrefix` is the public URL prefix of our
 * storage bucket: uploaded photos/videos must live there so arbitrary files can't be hot-linked in.
 */
export function sanitizeMedia(
  input: Partial<Record<keyof EventMediaSettings, unknown>>,
  storagePrefix: string | null
): { ok: true; media: EventMediaSettings } | { ok: false; error: string } {
  const type = input.mediaType as MediaType;
  if (type !== "image" && type !== "video_url" && type !== "video_upload") {
    return { ok: false, error: "Invalid media type." };
  }
  const url = typeof input.mediaUrl === "string" && input.mediaUrl.trim() ? input.mediaUrl.trim() : null;
  const poster = typeof input.posterUrl === "string" && input.posterUrl.trim() ? input.posterUrl.trim() : null;
  const onStorage = (v: string) => !!storagePrefix && v.startsWith(storagePrefix);

  if (url) {
    if (type === "video_url") {
      if (!parseVideoUrl(url)) {
        return { ok: false, error: "That video link isn't supported. Use YouTube, Vimeo, or a direct .mp4/.webm link." };
      }
    } else if (!onStorage(url)) {
      return { ok: false, error: "Uploaded media must be uploaded through the site." };
    }
  }
  if (poster && !onStorage(poster)) return { ok: false, error: "Invalid poster image." };

  const aspect = ASPECT_VALUES.includes(input.mediaAspect as MediaAspect)
    ? (input.mediaAspect as MediaAspect)
    : DEFAULT_MEDIA.mediaAspect;
  const fit: MediaFit = input.mediaFit === "contain" ? "contain" : "cover";
  const size = SIZE_VALUES.includes(input.mediaSize as MediaSize) ? (input.mediaSize as MediaSize) : "full";

  return {
    ok: true,
    media: {
      mediaType: type,
      mediaUrl: url,
      posterUrl: poster,
      mediaAspect: aspect,
      mediaFit: fit,
      mediaZoom: clamp(input.mediaZoom, 1, 3, 1),
      mediaX: clamp(input.mediaX, 0, 100, 50),
      mediaY: clamp(input.mediaY, 0, 100, 50),
      mediaSize: size,
    },
  };
}
