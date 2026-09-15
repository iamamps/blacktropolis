import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

export const metadata: Metadata = {
  title: "Blacktropolis — Find Your City's Hottest Events",
  description:
    "Discover parties and events near you, and join the Blacktropolis business network to promote your own.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
        <main className="pb-16">{children}</main>
      </body>
    </html>
  );
}
