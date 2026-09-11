import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Coding Checklist",
  description: "A practical manual security checklist for developers and code reviews.",
  openGraph: { title: "Security Coding Checklist", description: "A practical manual security checklist for developers and code reviews." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<Analytics /></body></html>;
}
