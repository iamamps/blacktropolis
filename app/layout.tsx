import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { SITE_LOGO } from "@/lib/organizations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.divinenine.org"),
  title: "The Divine Nine Events — Every Campus. Every HBCU. Every City.",
  description:
    "The national home for Divine Nine events: step shows, homecomings, mixers, service days and conventions for Alpha Phi Alpha, Alpha Kappa Alpha, Kappa Alpha Psi, Delta Sigma Theta, Omega Psi Phi, Zeta Phi Beta, Phi Beta Sigma, Sigma Gamma Rho and Iota Phi Theta.",
  icons: {
    icon: SITE_LOGO,
    apple: SITE_LOGO,
  },
  openGraph: {
    title: "The Divine Nine Events",
    description: "Find Divine Nine events at every campus, HBCU and city across the country.",
    siteName: "The Divine Nine Events",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050403",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050403]">
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
