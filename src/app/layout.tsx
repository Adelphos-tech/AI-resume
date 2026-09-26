import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RoleRace",
  description: "Career intelligence and resume platform.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("font-sans", geist.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
