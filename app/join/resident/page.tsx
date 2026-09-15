import { SignupForm } from "@/components/signup-form";

export default function ResidentSignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-3xl font-black text-white">
        Become a <span className="bt-gradient-text">Resident</span>
      </h1>
      <p className="mb-8 text-gray-400">
        Free membership — get your digital Blacktropolis ID and start discovering events.
      </p>
      <SignupForm role="resident" />
    </div>
  );
}
