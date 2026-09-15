"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-[#f2c14e]" />
        <h1 className="mb-2 text-2xl font-black text-white">Check Your Email</h1>
        <p className="text-gray-400">
          If an account exists for <span className="text-white">{email}</span>, we've sent a
          password reset link. It expires in 1 hour.
        </p>
        <Link href="/login" className="mt-6 text-sm font-semibold text-[#f2c14e]">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-3xl font-black text-white">
        Reset <span className="bt-gradient-text">Password</span>
      </h1>
      <p className="mb-8 text-gray-400">
        Enter your account email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bt-card px-4 py-3">
          <Mail className="h-4 w-4 text-[#f2c14e]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
          />
        </div>
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
        >
          {loading ? "Sending…" : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        <Link href="/login" className="font-semibold text-[#f2c14e]">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
