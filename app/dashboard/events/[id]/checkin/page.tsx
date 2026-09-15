"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import jsQR from "jsqr";
import { ArrowLeft, CheckCircle2, XCircle, Camera, CameraOff } from "lucide-react";

interface CheckinResult {
  ok: boolean;
  message: string;
  code: string;
}

export default function CheckInPage() {
  const params = useParams();
  const eventId = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [busy, setBusy] = useState(false);
  const lastScannedRef = useRef<string>("");

  const submitCode = useCallback(async (code: string) => {
    if (!code || busy) return;
    setBusy(true);
    const res = await fetch("/api/tickets/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setResult({
      ok: res.ok,
      message: res.ok ? "Checked in successfully!" : data.error || "Check-in failed.",
      code,
    });
    setBusy(false);
    setTimeout(() => {
      lastScannedRef.current = "";
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      if (streamRef.current) requestAnimationFrame(tick);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data && code.data !== lastScannedRef.current) {
      lastScannedRef.current = code.data;
      submitCode(code.data.trim().toUpperCase());
    }
    if (streamRef.current) requestAnimationFrame(tick);
  }, [submitCode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      requestAnimationFrame(tick);
    } catch {
      setResult({ ok: false, message: "Could not access camera. Use manual entry below.", code: "" });
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCode(manualCode.trim().toUpperCase());
    setManualCode("");
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <Link
        href={`/dashboard/events/${eventId}/tickets`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#f2c14e]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <h1 className="mb-6 text-3xl font-black text-white">
        Ticket <span className="bt-gradient-text">Check-In</span>
      </h1>

      <div className="mb-6 overflow-hidden rounded-2xl bt-card">
        <div className="relative aspect-square w-full bg-black">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="h-10 w-10 text-gray-600" />
            </div>
          )}
        </div>
        <div className="p-4">
          {scanning ? (
            <button
              onClick={stopCamera}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#ef4444]/40 py-2.5 text-sm font-bold text-[#ef4444]"
            >
              <CameraOff className="h-4 w-4" /> Stop Scanner
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex w-full items-center justify-center gap-2 rounded-full bt-gold-btn py-2.5 text-sm font-bold"
            >
              <Camera className="h-4 w-4" /> Start Camera Scanner
            </button>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-2xl p-4 ${
            result.ok ? "bg-[#f2c14e]/10 text-[#f2c14e]" : "bg-[#ef4444]/10 text-[#ef4444]"
          }`}
        >
          {result.ok ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          <div>
            <p className="font-bold">{result.message}</p>
            {result.code && <p className="font-mono text-xs opacity-80">{result.code}</p>}
          </div>
        </div>
      )}

      <div className="rounded-2xl bt-card p-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-400">Or enter code manually</h2>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="BT-XXXXXXXXXX"
            className="flex-1 rounded-xl bg-black/40 px-4 py-2.5 font-mono text-white outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bt-gold-btn px-5 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            Check In
          </button>
        </form>
      </div>
    </div>
  );
}
