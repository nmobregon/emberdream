"use client";

import { useEffect, useState } from "react";
import { CandleItem } from "./candle-item";
import { useLanguage } from "../_contexts/language-context";

interface CandleDrawerProps {
  candleName: string | null;
  onClose: () => void;
}

export function CandleDrawer({ candleName, onClose }: CandleDrawerProps) {
  const { t } = useLanguage();
  const [candle, setCandle] = useState<string>();
  const [candleData, setCandleData] = useState<{ wish: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (!candleName) return;

    (async () => {
      const res = await fetch(`/api/candle/${candleName}`);
      const json = await res.json();
      setCandle(json);
      try {
        const parsed = JSON.parse(json);
        setCandleData(parsed);
      } catch (e) {
        console.error("Error parsing candle data:", e);
      }
    })();
  }, [candleName]);

  // Calculate time remaining
  useEffect(() => {
    if (!candleName) return;

    const calculateTimeRemaining = () => {
      const [, createdAt] = candleName.split("-");
      const createdTime = +createdAt;
      const candleDuration = 720 * 60 * 1000; // 12 hours in ms (720 minutes)
      const endTime = createdTime + candleDuration;
      const remaining = endTime - Date.now();

      if (remaining <= 0) {
        setTimeRemaining(t("candle.page.time.expired"));
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [candleName, t]);

  if (!candleName) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black z-40
          transition-all duration-300 ease-in-out
          ${candleName ? "opacity-50 backdrop-blur-sm" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      />

      {/* Drawer - Side on desktop, bottom sheet on mobile */}
      <div
        className={`
          fixed z-50 
          bg-gradient-to-b from-gray-900 to-black
          overflow-y-auto
          shadow-2xl
          
          /* Mobile: bottom sheet */
          bottom-0 left-0 right-0 
          max-h-[85vh] rounded-t-3xl
          md:rounded-t-none
          
          /* Desktop: right side drawer */
          md:top-0 md:right-0 md:bottom-0 md:left-auto
          md:w-[500px] md:max-h-full md:rounded-l-3xl
          
          border-t-2 md:border-t-0 md:border-l-2
          border-amber-500 border-opacity-30
          
          /* Animations */
          transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          
          ${
            candleName
              ? "translate-y-0 md:translate-x-0 opacity-100 scale-100"
              : "translate-y-full md:translate-y-0 md:translate-x-full opacity-0 scale-95"
          }
        `}
      >
        {/* Handle bar for mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-600 rounded-full transition-all duration-300 hover:bg-gray-500"></div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10
            p-2 rounded-full
            hover:bg-amber-500 hover:bg-opacity-20
            transition-all duration-200
            hover:rotate-90 hover:scale-110
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
          "
          aria-label="Close drawer"
        >
          <span className="text-2xl">✕</span>
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 pt-12">
          <div className={`
            text-center mb-6
            transition-all duration-500 delay-100
            ${candleName ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-glow">
              🕯️ {t("candle.page.title")}
            </h2>
            <p className="text-gray-300 text-base">
              {t("candle.page.subtitle")}
            </p>
          </div>

          {candle && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700 delay-200">
              {/* Decorative top border */}
              <div className="flex items-center gap-4 w-full justify-center">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
                <span className="text-2xl">✨</span>
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
              </div>

              {/* Candle */}
              <div className={`
                transition-all duration-500 delay-300
                ${candleName ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
              `}>
                <CandleItem name={candleName} candle={candle} navigate={false} />
              </div>

              {/* Time Remaining */}
              {timeRemaining && (
                <div className={`
                  w-full
                  transition-all duration-500 delay-[400ms]
                  ${candleName ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}>
                  <div className="glass rounded-xl p-4 border border-amber-500 border-opacity-30 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">
                          {t("candle.page.time.remaining")}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-amber-300 font-mono tabular-nums">
                          {timeRemaining}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Full Wish Text */}
              {candleData && (
                <div className={`
                  w-full
                  transition-all duration-500 delay-500
                  ${candleName ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                `}>
                  <div className="glass-light rounded-xl p-6 border border-amber-500 border-opacity-20">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 text-amber-300 text-center">
                      💫 {t("candle.page.wish.title")}
                    </h3>
                    <p className="text-base md:text-lg text-gray-200 leading-relaxed text-center">
                      &quot;{candleData.wish}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Decorative bottom border */}
              <div className="flex items-center gap-4 w-full justify-center">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
                <span className="text-2xl">🌟</span>
                <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
              </div>

              {/* Message */}
              <p className={`
                text-center text-gray-400 text-sm md:text-base italic max-w-md
                transition-all duration-500 delay-[600ms]
                ${candleName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                {t("candle.page.message")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

