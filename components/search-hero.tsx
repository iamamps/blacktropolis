"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export function SearchHero() {
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    router.push(`/events?${params.toString()}`);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const params = new URLSearchParams({
        lat: String(pos.coords.latitude),
        lng: String(pos.coords.longitude),
      });
      router.push(`/events?${params.toString()}`);
    });
  };

  return (
    <form
      onSubmit={handleSearch}
      className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
    >
      <div className="flex flex-1 items-center gap-2 rounded-full bt-card px-4 py-3">
        <MapPin className="h-5 w-5 shrink-0 text-[#f2c14e]" />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter your city or zip code"
          className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bt-gold-btn px-6 py-3 font-bold shadow-lg shadow-[#f2c14e]/30"
      >
        <Search className="h-4 w-4" /> Find Events
      </button>
      <button
        type="button"
        onClick={useMyLocation}
        className="rounded-full border border-[#f2c14e]/40 px-4 py-3 text-sm text-gray-300 hover:text-[#f2c14e]"
      >
        Use My Location
      </button>
    </form>
  );
}
