import { Play } from "lucide-react";
import type { EventMediaSettings } from "@/types";
import { SIZES, aspectRatioCss, parseVideoUrl } from "@/lib/media";

export type MediaLike = Partial<EventMediaSettings> & { flyerDataUrl?: string | null };

interface EventMediaProps {
  media: MediaLike;
  title: string;
  /** card = fixed thumbnail in a grid; detail = full frame honoring the chosen size/aspect */
  mode: "card" | "detail";
}

function imgStyle(m: MediaLike): React.CSSProperties {
  const x = m.mediaX ?? 50;
  const y = m.mediaY ?? 50;
  const zoom = m.mediaZoom ?? 1;
  return {
    objectFit: m.mediaFit ?? "cover",
    objectPosition: `${x}% ${y}%`,
    transform: zoom > 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  };
}

function Placeholder({ big }: { big?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a2110] via-[#0c0906] to-[#2a2110]">
      <span className={`${big ? "text-7xl" : "text-4xl"} font-black bt-gradient-text opacity-60`}>IX</span>
    </div>
  );
}

function PlayBadge() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 ring-2 ring-[#f2c14e]">
        <Play className="h-5 w-5 translate-x-0.5 text-[#f2c14e]" />
      </span>
    </span>
  );
}

export function EventMedia({ media, title, mode }: EventMediaProps) {
  const type = media.mediaType ?? "image";
  const url = media.mediaUrl || null;
  const poster = media.posterUrl || null;

  const parsed = type === "video_url" && url ? parseVideoUrl(url) : null;
  const fileSrc =
    type === "video_upload" && url ? url : parsed && parsed.provider === "file" ? parsed.url : null;
  const imageSrc = type === "image" ? url || media.flyerDataUrl || null : null;

  // ---------- card thumbnail ----------
  if (mode === "card") {
    let inner: React.ReactNode;
    if (imageSrc) {
      // eslint-disable-next-line @next/next/no-img-element
      inner = <img src={imageSrc} alt={title} className="h-full w-full" style={imgStyle(media)} />;
    } else if (parsed?.provider === "youtube" || poster) {
      const thumb = poster || (parsed?.provider === "youtube" ? parsed.thumbnail : null);
      inner = (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb as string} alt={title} className="h-full w-full" style={imgStyle(media)} />
          <PlayBadge />
        </>
      );
    } else if (fileSrc) {
      inner = (
        <>
          <video
            src={`${fileSrc}#t=0.5`}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full"
            style={imgStyle(media)}
          />
          <PlayBadge />
        </>
      );
    } else if (parsed?.provider === "vimeo") {
      inner = (
        <>
          <Placeholder />
          <PlayBadge />
        </>
      );
    } else {
      inner = <Placeholder />;
    }
    return <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">{inner}</div>;
  }

  // ---------- detail frame ----------
  const sizeClass = SIZES.find((s) => s.value === (media.mediaSize ?? "full"))?.className ?? "max-w-none";
  const aspect = media.mediaAspect ?? "original";
  const ratio = aspectRatioCss(aspect);
  const wrap = `mx-auto w-full ${sizeClass}`;

  if (imageSrc) {
    if (!ratio) {
      return (
        <div className={wrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={title} className="block h-auto w-full" />
        </div>
      );
    }
    return (
      <div className={wrap}>
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc} alt={title} className="h-full w-full" style={imgStyle(media)} />
        </div>
      </div>
    );
  }

  if (parsed && parsed.provider !== "file") {
    return (
      <div className={wrap}>
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: ratio ?? "16 / 9" }}>
          <iframe
            src={parsed.embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    );
  }

  if (fileSrc) {
    return (
      <div className={wrap}>
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: ratio ?? "16 / 9" }}>
          <video
            src={fileSrc}
            poster={poster || undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full"
            style={imgStyle(media)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <div className="relative h-56 w-full overflow-hidden">
        <Placeholder big />
      </div>
    </div>
  );
}
