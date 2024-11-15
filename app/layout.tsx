export const dynamic = "force-dynamic";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import { Analytics } from "@/components/Analytics";

import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ibm-plex-serif",
});

export const metadata: Metadata = {
  title: "ClearBank",
  description: "ClearBank is a modern banking platform for everyone.",
  icons: {
    icon: "/icons/clearbank_logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
