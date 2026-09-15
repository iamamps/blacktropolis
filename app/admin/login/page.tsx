"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect passcode.");
      return;
    }
    router.push("/admin/ads");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-black text-white">
        Admin <span className="bt-gradient-text">Access</span>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl bt-card px-4 py-3">
          <Lock className="h-4 w-4 text-[#f2c14e]" />
          <input
            type="password"
            required
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
          />
        </div>
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
