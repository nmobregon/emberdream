"use client";

import Link from "next/link";
import { useLanguage } from "../_contexts/language-context";
import { LanguageSelector } from "./language-selector";

export function LayoutContent({
  children,
  permanenMarkerClassName,
}: {
  children: React.ReactNode;
  permanenMarkerClassName: string;
}) {
  const { t } = useLanguage();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md">
        <div className="flex flex-row gap-2 md:gap-5 items-center justify-between px-3 md:px-6 py-2 md:py-4 max-w-7xl mx-auto">
          <Link href="/" className="transition-transform hover:scale-105 flex-shrink-0">
            <h1
              className={`text-xl md:text-4xl font-bold text-glow ${permanenMarkerClassName}`}
            >
              ✨ {t("header.title")}
            </h1>
          </Link>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <LanguageSelector />
            <Link
              target="_blank"
              href="https://cafecito.app/emberdream"
              className="text-xs md:text-base rounded-full px-3 py-1.5 md:px-5 md:py-2.5 font-medium
                bg-gradient-to-r from-amber-600 to-orange-600 
                text-white shadow-lg
                hover:from-amber-500 hover:to-orange-500
                hover:shadow-xl hover:scale-105
                transition-all duration-300 ease-out
                glow-warm-hover whitespace-nowrap"
              id="donate_btn"
            >
              ☕ {t("header.donate")}
            </Link>
          </div>
        </div>
      </header>
      <div className="pt-16 md:pt-24 min-h-screen px-4 md:px-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </>
  );
}

