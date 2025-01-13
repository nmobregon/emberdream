import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const permanenMarker = Permanent_Marker({
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ember Dream",
  description: "A place for your wishes to burn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col md:flex-row gap-5 items-center justify-between px-4 py-2">
          <Link href="/">
            <h1 className={`text-4xl font-bold ${permanenMarker.className}`}>
              Ember Dream
            </h1>
          </Link>
          <Link
            target="_blank"
            href="https://cafecito.app/emberdream"
            className="text-sm rounded-md text-black bg-gray-300 px-4 py-2"
            id="donate_btn"
          >
            Buy me a coffee / Invítame un cafecito
          </Link>
        </div>
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          {children}
        </div>
      </body>
    </html>
  );
}
