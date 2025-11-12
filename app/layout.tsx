import type { Metadata } from "next";
import { Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./_contexts/language-context";
import { LayoutContent } from "./_components/layout-content";

const permanenMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
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
  title: "Candelei",
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
        <LanguageProvider>
          <LayoutContent permanenMarkerClassName={permanenMarker.className}>
            {children}
          </LayoutContent>
        </LanguageProvider>
      </body>
    </html>
  );
}
