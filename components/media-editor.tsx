"use client";

import { useState } from "react";
import { Upload, Globe, Film, Image as ImageIcon, Loader2, Trash } from "lucide-react";
import type { EventMediaSettings, MediaAspect, MediaSize } from "@/types";
import { ASPECTS, SIZES, parseVideoUrl } from "@/lib/media";
import { EventMedia } from "@/components/event-media";
import { ImageCropper } from "@/components/image-cropper";
import { MAX_VIDEO_BYTES, MAX_IMAGE_BYTES, VIDEO_TYPES, IMAGE_TYPES } from "@/lib/storage-limits";
import {
  formatBytes,
  resizeImageFile,
  uploadBlob,
  videoPosterFromFile,
} from "@/lib/upload-client";

type Tab = "image" | "video_url" | "video_upload";

interface MediaEditorProps {
  value: EventMediaSettings;
  onChange: (v: EventMediaSettings) => void;
  /** an inline flyer from before photo storage existed; can be re-cropped/resized */
  legacyImage?: string | null;
  /** called when the user removes the media (so the form can also clear a legacy flyer) */
  onClearLegacy?: () => void;
}

const TABS: { id: Tab; label: string; icon: typeof Upload }[] = [
  { id: "image", label: "Photo / Flyer", icon: ImageIcon },
  { id: "video_url", label: "Video link", icon: Globe },
  { id: "video_upload", label: "Upload trailer", icon: Film },
];

export function MediaEditor({ value, onChange, legacyImage, onClearLegacy }: MediaEditorProps) {
  const [tab, setTab] = useState<Tab>(value.mediaType);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [link, setLink] = useState(value.mediaType === "video_url" ? value.mediaUrl || "" : "");

  const set = (patch: Partial<EventMediaSettings>) => onChange({ ...value, ...patch });
  const hasMedia = !!value.mediaUrl || !!legacyImage;
  const isVideo = value.mediaType !== "image" && !!value.mediaUrl;
  const parsed = link.trim() ? parseVideoUrl(link) : null;
  const currentImage = value.mediaType === "image" ? value.mediaUrl || legacyImage || null : null;

  const fail = (e: unknown) => {
    setError(e instanceof Error ? e.message : "Something went wrong.");
    setBusy(false);
    setProgress(null);
    setStatus("");
  };

  // ---------- photo ----------
  const pickImage = (file: File) => {
    setError("");
    if (!IMAGE_TYPES.includes(file.type)) return setError("Please choose a JPG, PNG, WebP or GIF image.");
    if (file.size > 30 * 1024 * 1024) return setError("That image is over 30 MB. Please choose a smaller one.");
    setCropSrc(URL.createObjectURL(file));
  };

  const applyCrop = async (blob: Blob, aspect: MediaAspect) => {
    setBusy(true);
    setError("");
    try {
      if (blob.size > MAX_IMAGE_BYTES) throw new Error("Result is over 12 MB. Choose a smaller output size.");
      const url = await uploadBlob(blob, { onProgress: setProgress });
      onChange({
        ...value,
        mediaType: "image",
        mediaUrl: url,
        posterUrl: null,
        mediaAspect: aspect,
        mediaFit: "cover",
        mediaZoom: 1,
        mediaX: 50,
        mediaY: 50,
      });
      setStatus(`Saved · ${formatBytes(blob.size)}`);
      setCropSrc(null);
    } catch (e) {
      fail(e);
      return;
    }
    setBusy(false);
    setProgress(null);
  };

  // ---------- video link ----------
  const useLink = () => {
    setError("");
    if (!parsed) {
      return setError("That link isn't supported. Paste a YouTube or Vimeo link, or a direct .mp4 / .webm file link.");
    }
    onChange({
      ...value,
      mediaType: "video_url",
      mediaUrl: link.trim(),
      posterUrl: value.mediaType === "video_url" ? value.posterUrl : null,
      mediaAspect: value.mediaAspect === "original" ? "16:9" : value.mediaAspect,
    });
  };

  const pickPoster = async (file: File) => {
    setError("");
    if (!IMAGE_TYPES.includes(file.type)) return setError("Please choose an image for the thumbnail.");
    setBusy(true);
    try {
      const small = await resizeImageFile(file, 1280);
      const url = await uploadBlob(small, { onProgress: setProgress });
      set({ posterUrl: url });
    } catch (e) {
      return fail(e);
    }
    setBusy(false);
    setProgress(null);
  };

  // ---------- uploaded trailer ----------
  const pickVideo = async (file: File) => {
    setError("");
    if (!VIDEO_TYPES.includes(file.type)) return setError("Please choose an MP4, WebM or MOV video.");
    if (file.size > MAX_VIDEO_BYTES) {
      return setError(`That video is ${formatBytes(file.size)}. The limit is 100 MB — export a shorter or lower-resolution trailer.`);
    }
    setBusy(true);
    try {
      let posterUrl: string | null = null;
      setStatus("Creating thumbnail…");
      try {
        const poster = await videoPosterFromFile(file);
        posterUrl = await uploadBlob(poster);
      } catch {
        posterUrl = null; // thumbnail is optional
      }
      setStatus("Uploading video…");
      const url = await uploadBlob(file, { onProgress: setProgress });
      onChange({
        ...value,
        mediaType: "video_upload",
        mediaUrl: url,
        posterUrl,
        mediaAspect: value.mediaAspect === "original" ? "16:9" : value.mediaAspect,
      });
      setStatus(`Uploaded · ${formatBytes(file.size)}`);
    } catch (e) {
      return fail(e);
    }
    setBusy(false);
    setProgress(null);
  };

  const remove = () => {
    onChange({ ...value, mediaType: "image", mediaUrl: null, posterUrl: null });
    onClearLegacy?.();
    setLink("");
    setStatus("");
  };

  const fileBtn =
    "flex cursor-pointer items-center gap-2 rounded-xl bt-card px-4 py-3 text-sm text-gray-300 hover:text-[#f2c14e]";

  return (
    <div className="space-y-4 rounded-2xl border border-[#f2c14e]/25 bg-black/20 p-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setError("");
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              tab === t.id ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ---- change media ---- */}
      {tab === "image" && (
        <div className="space-y-3">
          {cropSrc ? (
            <ImageCropper
              src={cropSrc}
              busy={busy}
              progress={progress}
              onApply={applyCrop}
              onCancel={() => setCropSrc(null)}
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              <label className={fileBtn}>
                <Upload className="h-4 w-4" /> {currentImage ? "Choose a different photo" : "Choose a photo or flyer"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) pickImage(f);
                    e.target.value = "";
                  }}
                />
              </label>
              {currentImage && (
                <button type="button" onClick={() => setCropSrc(currentImage)} className={fileBtn}>
                  Resize / re-crop current photo
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "video_url" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Paste a YouTube, Vimeo or .mp4 link"
              className="w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500"
            />
            <button
              type="button"
              onClick={useLink}
              disabled={!link.trim()}
              className="rounded-full bt-gold-btn px-5 py-2 text-sm disabled:opacity-50"
            >
              Use this video
            </button>
          </div>
          {link.trim() && (
            <p className={`text-xs ${parsed ? "text-green-400" : "text-[#ef4444]"}`}>
              {parsed
                ? parsed.provider === "file"
                  ? "Direct video file detected."
                  : `${parsed.provider === "youtube" ? "YouTube" : "Vimeo"} video detected.`
                : "Not a supported video link yet."}
            </p>
          )}
          {value.mediaType === "video_url" && value.mediaUrl && (
            <label className={fileBtn}>
              <Upload className="h-4 w-4" /> {value.posterUrl ? "Change thumbnail" : "Add a custom thumbnail (optional)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickPoster(f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      )}

      {tab === "video_upload" && (
        <div className="space-y-3">
          <label className={fileBtn}>
            <Upload className="h-4 w-4" /> {value.mediaType === "video_upload" ? "Replace trailer" : "Choose a trailer video"}
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickVideo(f);
                e.target.value = "";
              }}
            />
          </label>
          <p className="text-xs text-gray-500">MP4 works best on every phone. Up to 100 MB. A thumbnail is captured automatically.</p>
        </div>
      )}

      {busy && !cropSrc && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin text-[#f2c14e]" /> {status || "Working…"}
            {progress != null && ` ${progress}%`}
          </div>
          {progress != null && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-[#f2c14e] transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
      {!busy && status && <p className="text-xs text-green-400">{status}</p>}
      {error && <p className="text-sm text-[#ef4444]">{error}</p>}

      {/* ---- live preview + size/frame controls ---- */}
      {hasMedia && !cropSrc && (
        <div className="space-y-4 border-t border-[#f2c14e]/15 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview — how it will look on the event page</p>
            <button type="button" onClick={remove} className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#ef4444]">
              <Trash className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
          <div className="overflow-hidden rounded-xl bg-black/40 p-3">
            <EventMedia media={{ ...value, flyerDataUrl: legacyImage }} title="Preview" mode="detail" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs text-gray-400">Display size on the event page</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set({ mediaSize: s.value as MediaSize })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      value.mediaSize === s.value ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {isVideo && (
              <div>
                <p className="mb-1.5 text-xs text-gray-400">Video frame shape</p>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.filter((a) => a.value !== "original").map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => set({ mediaAspect: a.value })}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        value.mediaAspect === a.value ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isVideo && value.mediaType === "video_upload" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs text-gray-400">
                Zoom {value.mediaZoom.toFixed(2)}×
                <input type="range" min={1} max={3} step={0.05} value={value.mediaZoom} onChange={(e) => set({ mediaZoom: Number(e.target.value) })} className="mt-1 w-full accent-[#f2c14e]" />
              </label>
              <label className="block text-xs text-gray-400">
                Focus left ↔ right
                <input type="range" min={0} max={100} value={value.mediaX} onChange={(e) => set({ mediaX: Number(e.target.value) })} className="mt-1 w-full accent-[#f2c14e]" />
              </label>
              <label className="block text-xs text-gray-400">
                Focus up ↕ down
                <input type="range" min={0} max={100} value={value.mediaY} onChange={(e) => set({ mediaY: Number(e.target.value) })} className="mt-1 w-full accent-[#f2c14e]" />
              </label>
            </div>
          )}
          {isVideo && (
            <p className="text-xs text-gray-500">
              Videos play exactly as uploaded — the size, shape and focus above control how the video is framed on the page and in the event list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
