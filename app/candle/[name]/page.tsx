"use client";
import { CandleItem } from "@/app/_components/candle-item";
import { use, useEffect, useState } from "react";
import { useLanguage } from "@/app/_contexts/language-context";

export default function CandlePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { t } = useLanguage();
  const nameParam = use(params);
  const [candle, setCandle] = useState<string>();
  const [candleData, setCandleData] = useState<{ wish: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/candle/${nameParam.name}`);
      const json = await res.json();
      setCandle(json);
      try {
        const parsed = JSON.parse(json);
        setCandleData(parsed);
      } catch (e) {
        console.error("Error parsing candle data:", e);
      }
    })();
  }, [nameParam.name]);

  // Calculate time remaining
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const [, createdAt] = nameParam.name.split("-");
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
  }, [nameParam.name, t]);

  return (
    <div className="flex flex-col items-center min-h-[70vh] w-full py-10 md:py-16 px-4">
      <div className="text-center mb-8 mt-4 md:mt-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-glow">
          🕯️ {t("candle.page.title")}
        </h2>
        <p className="text-gray-300 text-base md:text-lg">
          {t("candle.page.subtitle")}
        </p>
      </div>
      {candle && (
        <div className="
          glass-light rounded-3xl p-8 md:p-12
          glow-warm
          max-w-2xl w-full
          transition-all duration-300
          border border-amber-500 border-opacity-20
        ">
          <div className="flex flex-col items-center gap-6">
            {/* Decorative top border */}
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
              <span className="text-2xl">✨</span>
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent flex-1 opacity-30"></div>
            </div>
            
            {/* Candle */}
            <CandleItem name={nameParam.name} candle={candle} navigate={false} />
            
            {/* Time Remaining */}
            {timeRemaining && (
              <div className="w-full">
                <div className="glass rounded-xl p-4 border border-amber-500 border-opacity-30 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">{t("candle.page.time.remaining")}</p>
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
              <div className="w-full">
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
            <p className="text-center text-gray-400 text-sm md:text-base italic max-w-md">
              {t("candle.page.message")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
