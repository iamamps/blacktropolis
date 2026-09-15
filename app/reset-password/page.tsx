"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not reset password.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-4 text-[#ef4444]">Missing or invalid reset link.</p>
        <Link href="/forgot-password" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
          Request a New Link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-[#f2c14e]" />
        <h1 className="mb-2 text-2xl font-black text-white">Password Updated</h1>
        <p className="text-gray-400">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-8 text-3xl font-black text-white">
        Set a New <span className="bt-gradient-text">Password</span>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bt-card px-4 py-3">
          <Lock className="h-4 w-4 text-[#f2c14e]" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bt-card px-4 py-3">
          <Lock className="h-4 w-4 text-[#f2c14e]" />
          <input
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm Password"
            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
          />
        </div>
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
