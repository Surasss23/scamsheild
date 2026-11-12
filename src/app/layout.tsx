import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScamShield — Understand scams. Stay safer online.",
  description: "A free, multilingual cyber-safety awareness platform. Learn how scams work and explore practical safety tools in English, Hindi and Telugu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}