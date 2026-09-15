import Link from "next/link";
import { User, Building } from "lucide-react";

export default function JoinChoicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="mb-3 text-4xl font-black text-white">
        Join <span className="bt-gradient-text">Blacktropolis</span>
      </h1>
      <p className="mb-10 text-gray-400">Choose the type of membership that fits you.</p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/join/resident"
          className="rounded-2xl bt-card p-8 text-left transition hover:bt-glow"
        >
          <User className="mb-4 h-8 w-8 text-[#f2c14e]" />
          <h2 className="mb-2 text-xl font-bold text-white">I'm a Resident</h2>
          <p className="text-sm text-gray-400">
            Discover parties and events near you and get your free Blacktropolis digital
            membership card.
          </p>
        </Link>
        <Link
          href="/business/join"
          className="rounded-2xl bt-card p-8 text-left transition hover:bt-glow"
        >
          <Building className="mb-4 h-8 w-8 text-[#ef4444]" />
          <h2 className="mb-2 text-xl font-bold text-white">I'm a Business</h2>
          <p className="text-sm text-gray-400">
            Join the paid Blacktropolis Network to post your events and parties to the whole
            community.
          </p>
        </Link>
      </div>
    </div>
  );
}
