import Link from "next/link";
import { NineStripe } from "@/components/nine-stripe";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#f2c14e]/15">
      <NineStripe />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row">
        <p>© {new Date().getFullYear()} The Divine Nine Events</p>
        <nav className="flex flex-wrap justify-center gap-5">
          <Link href="/events" className="hover:text-[#f2c14e]">Events</Link>
          <Link href="/schools" className="hover:text-[#f2c14e]">Schools</Link>
          <Link href="/business/join" className="hover:text-[#f2c14e]">For Organizers</Link>
          <Link href="/login" className="hover:text-[#f2c14e]">Sign In</Link>
        </nav>
      </div>
      <p className="px-4 pb-8 text-center text-xs text-gray-600">
        Organization names and crests belong to their respective organizations. This site is an independent events directory.
      </p>
    </footer>
  );
}
