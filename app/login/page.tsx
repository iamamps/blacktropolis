"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-3xl font-black text-white">
        Welcome <span className="bt-gradient-text">Back</span>
      </h1>
      <p className="mb-8 text-gray-400">Sign in to your Blacktropolis account.</p>

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
        <div className="flex items-center gap-2 rounded-xl bt-card px-4 py-3">
          <Lock className="h-4 w-4 text-[#ef4444]" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
          />
        </div>
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-[#f2c14e]">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400">
        New here?{" "}
        <Link href="/join" className="font-semibold text-[#f2c14e]">
          Create a member account
        </Link>
      </p>
    </div>
  );
}
