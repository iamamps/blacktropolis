import { SignupForm } from "@/components/signup-form";
import { Building, CheckCircle } from "lucide-react";

export default function BusinessJoinPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-10 px-4 py-16 sm:grid-cols-2">
      <div>
        <Building className="mb-4 h-9 w-9 text-[#f2c14e]" />
        <h1 className="mb-3 text-3xl font-black text-white">
          Join the <span className="bt-gradient-text">Business Network</span>
        </h1>
        <p className="mb-6 text-gray-400">
          Create your free account first, then activate your paid Blacktropolis Network
          membership from your dashboard to start posting events.
        </p>
        <ul className="space-y-3 text-sm text-gray-300">
          {[
            "Post unlimited parties & events with flyers",
            "Sell tickets and check in guests by QR code",
            "Reach residents searching your city",
            "Get a digital Blacktropolis Business ID card",
            "Manage all your events from one dashboard",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ef4444]" /> {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bt-card p-6">
        <SignupForm role="business" />
      </div>
    </div>
  );
}
