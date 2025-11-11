"use client";

import { useLanguage } from "../_contexts/language-context";

export function CandlePlaceholder({ onClick }: { onClick: () => void }) {
  const { t } = useLanguage();
  
  return (
    <div
      onClick={onClick}
      className="
        flex flex-col justify-end w-[300px] h-[350px] self-center 
        glass-light rounded-t-full rounded-b-xl
        transition-all duration-300 ease-out
        opacity-30
        hover:opacity-50
        hover:scale-105
        hover:glow-warm
        overflow-hidden
        relative
        cursor-pointer
        group
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Empty candle silhouette */}
      <div className="flex w-full items-end justify-center h-[70%]">
        <div className="w-[34px] relative h-full flex flex-col items-center justify-end pb-4">
          {/* Unlit wick */}
          <div className="w-1.5 h-6 bg-gray-600 rounded-sm mb-1"></div>
          {/* Wax */}
          <div className="w-full h-[60%] bg-gray-700 rounded-t-lg"></div>
        </div>
      </div>

      {/* Info section placeholder */}
      <div className="flex flex-col items-center w-full glass px-4 py-3 mt-2 rounded-b-xl">
        <div className="w-32 h-4 bg-gray-700 rounded mb-2 animate-pulse"></div>
        <div className="w-24 h-3 bg-gray-700 rounded mb-1 animate-pulse"></div>
        <div className="w-20 h-2 bg-gray-700 rounded mb-2 animate-pulse"></div>
        <div className="flex justify-center w-full gap-3 pt-2 border-t border-gray-600 border-opacity-30">
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Overlay text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-gray-400 text-sm md:text-base font-medium text-center px-4 group-hover:text-amber-400 transition-colors mb-2">
          {t("candle.placeholder")}
        </p>
        <p className="text-gray-500 text-xs">✨</p>
      </div>
    </div>
  );
}

