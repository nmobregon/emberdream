"use client";

import { useLanguage } from "../_contexts/language-context";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={() => setLanguage("en")}
        className={`
          px-3 py-2 rounded-lg text-2xl
          transition-all duration-200
          ${
            language === "en"
              ? "bg-white bg-opacity-20 scale-110 ring-2 ring-amber-500 ring-opacity-50"
              : "hover:bg-white hover:bg-opacity-10 opacity-60 hover:opacity-100"
          }
        `}
        title="English"
        aria-label="Switch to English"
      >
        🇺🇸
      </button>
      <button
        onClick={() => setLanguage("es")}
        className={`
          px-3 py-2 rounded-lg text-2xl
          transition-all duration-200
          ${
            language === "es"
              ? "bg-white bg-opacity-20 scale-110 ring-2 ring-amber-500 ring-opacity-50"
              : "hover:bg-white hover:bg-opacity-10 opacity-60 hover:opacity-100"
          }
        `}
        title="Español"
        aria-label="Cambiar a Español"
      >
        🇪🇸
      </button>
    </div>
  );
}

