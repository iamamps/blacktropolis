"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Check, X } from "lucide-react";
import type { MediaAspect } from "@/types";
import { ASPECTS } from "@/lib/media";
import { canvasToBlob, loadImage } from "@/lib/upload-client";

const OUTPUT_SIZES = [
  { value: 720, label: "Small · 720 px" },
  { value: 1080, label: "Medium · 1080 px" },
  { value: 1600, label: "Large · 1600 px" },
  { value: 2000, label: "Extra large · 2000 px" },
];

const PREVIEW_W = 720;

interface ImageCropperProps {
  src: string;
  busy: boolean;
  progress: number | null;
  onApply: (blob: Blob, aspect: MediaAspect) => void;
  onCancel: () => void;
}

/**
 * Real crop + resize: drag to position, zoom in, pick a frame shape and an output size.
 * "Apply" renders the chosen crop to a new JPEG at exactly that size.
 */
export function ImageCropper({ src, busy, progress, onApply, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState("");
  const [aspect, setAspect] = useState<MediaAspect>("16:9");
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [outW, setOutW] = useState(1080);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImg(null);
    setLoadError("");
    loadImage(src)
      .then((i) => {
        if (cancelled) return;
        setImg(i);
        // Start in the shape that matches the picture best
        const r = i.naturalWidth / i.naturalHeight;
        setAspect(r > 1.4 ? "16:9" : r < 0.7 ? "9:16" : r < 0.95 ? "4:5" : "original");
      })
      .catch((e) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [src]);

  const ratio = (() => {
    if (!img) return 16 / 9;
    const a = ASPECTS.find((x) => x.value === aspect);
    return a?.ratio ?? img.naturalWidth / img.naturalHeight;
  })();
  const effectiveZoom = aspect === "original" ? 1 : zoom;

  const render = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      if (!img) return;
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);
      const base = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const s = base * effectiveZoom;
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const ox = (W - dw) * (pos.x / 100);
      const oy = (H - dh) * (pos.y / 100);
      ctx.drawImage(img, ox, oy, dw, dh);
    },
    [img, effectiveZoom, pos]
  );

  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !img) return;
    c.width = PREVIEW_W;
    c.height = Math.max(2, Math.round(PREVIEW_W / ratio));
    render(c.getContext("2d")!, c.width, c.height);
  }, [img, ratio, render]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    const c = canvasRef.current;
    if (!d || !c || !img) return;
    const rect = c.getBoundingClientRect();
    const k = c.width / rect.width; // css px -> canvas px
    const base = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
    const s = base * effectiveZoom;
    const freeX = c.width - img.naturalWidth * s;
    const freeY = c.height - img.naturalHeight * s;
    const nx = freeX !== 0 ? d.x + (((e.clientX - d.px) * k) / freeX) * 100 : d.x;
    const ny = freeY !== 0 ? d.y + (((e.clientY - d.py) * k) / freeY) * 100 : d.y;
    setPos({ x: Math.min(100, Math.max(0, nx)), y: Math.min(100, Math.max(0, ny)) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const outH = Math.round(outW / ratio);
  const upscaled = img ? outW > img.naturalWidth / effectiveZoom : false;

  const apply = async () => {
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    render(out.getContext("2d")!, out.width, out.height);
    const blob = await canvasToBlob(out, "image/jpeg", 0.9);
    onApply(blob, aspect);
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-[#ef4444]/40 p-4 text-sm text-[#ef4444]">
        {loadError}
        <button type="button" onClick={onCancel} className="ml-3 underline">
          Close
        </button>
      </div>
    );
  }
  if (!img) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading image…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#f2c14e]/30 bg-black/30 p-4">
      <div className="flex flex-wrap gap-2">
        {ASPECTS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => {
              setAspect(a.value);
              setPos({ x: 50, y: 50 });
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              aspect === a.value ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
            }`}
            title={a.hint}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg ring-1 ring-[#f2c14e]/40">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`block h-auto w-full touch-none ${aspect === "original" ? "" : "cursor-grab active:cursor-grabbing"}`}
        />
      </div>
      {aspect !== "original" && (
        <p className="text-center text-xs text-gray-500">Drag the picture to position it, use the slider to zoom.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs text-gray-400">
          Zoom {effectiveZoom.toFixed(2)}×
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={effectiveZoom}
            disabled={aspect === "original"}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-1 w-full accent-[#f2c14e] disabled:opacity-40"
          />
        </label>
        <label className="block text-xs text-gray-400">
          Output size
          <select
            value={outW}
            onChange={(e) => setOutW(Number(e.target.value))}
            className="mt-1 w-full rounded-lg bt-card px-3 py-2 text-sm text-white outline-none"
          >
            {OUTPUT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-gray-400">
        Will be saved at <span className="font-semibold text-white">{outW} × {outH} px</span>
        {upscaled && <span className="text-[#f2c14e]"> — your original is smaller, so it will be enlarged (may look soft)</span>}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={apply}
          className="flex items-center gap-2 rounded-full bt-gold-btn px-5 py-2 text-sm disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {busy ? (progress != null ? `Uploading ${progress}%` : "Processing…") : "Apply size & use this photo"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="flex items-center gap-1 rounded-full border border-[#f2c14e]/30 px-4 py-2 text-sm text-gray-300"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </div>
  );
}
