"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types";

export function SignupForm({ role }: { role: Role }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
    city: "",
    state: "",
    zip: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push(role === "business" ? "/dashboard?upgrade=1" : "/dashboard");
    router.refresh();
  };

  const inputClass =
    "w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        placeholder={role === "business" ? "Your Full Name" : "Full Name"}
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        className={inputClass}
      />
      {role === "business" && (
        <>
          <input
            required
            placeholder="Business Name"
            value={form.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Business Category (e.g. Nightclub, Promoter, Venue)"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          />
        </>
      )}
      <input
        required
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        className={inputClass}
      />
      <input
        required
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => update("password", e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className={`${inputClass} col-span-1`}
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
          className={`${inputClass} col-span-1`}
        />
        <input
          required
          placeholder="Zip Code"
          value={form.zip}
          onChange={(e) => update("zip", e.target.value)}
          className={`${inputClass} col-span-1`}
        />
      </div>
      {error && <p className="text-sm text-[#ef4444]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}
