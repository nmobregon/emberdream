"use client";

import { useState, useEffect } from "react";
import { Candle } from "./candle";
import { countries } from "../_data/countries";
import { useLanguage } from "../_contexts/language-context";

export function CandleItem(candleProp: {
  name: string;
  candle: string;
  navigate: boolean;
  onCandleClick?: () => void;
}) {
  const { t, language } = useLanguage();
  const candle = JSON.parse(candleProp.candle);
  const [support, setSupport] = useState(candle.support || 0);
  const [isSupporting, setIsSupporting] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);
  const [name, createdAt] = candleProp.name.split("-");

  // Check localStorage on mount to see if user has already supported this candle
  useEffect(() => {
    const supportedData = JSON.parse(localStorage.getItem("candelei-supported-candles") || "{}");
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    
    // Clean up expired entries
    const cleanedData: Record<string, number> = {};
    Object.keys(supportedData).forEach((candleName) => {
      const timestamp = supportedData[candleName];
      if (now - timestamp < twelveHours) {
        cleanedData[candleName] = timestamp;
      }
    });
    
    // Save cleaned data back to localStorage
    localStorage.setItem("candelei-supported-candles", JSON.stringify(cleanedData));
    
    // Check if current candle is in the list
    setHasSupported(candleProp.name in cleanedData);
  }, [candleProp.name]);
  const height =
    ((Date.now() - +createdAt) * 100) /
    (+(process.env.CANDLE_DURATION ?? 720) * 60 * 1000);
  const country = countries.find((c) => c.code === candle.country)?.name;
  
  // Format date based on language context
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const locale = language === "es" ? "es-ES" : "en-US";
    return date.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  const candleObj = {
    ...candle,
    height,
    country,
    name,
    date: formatDate(+createdAt),
    color: candle.color || "#ff9224", // Default to classic orange if no color stored
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onShare = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    if (navigator.share) {
      try {
        const url = `${window.location.origin}${window.location.pathname}#${candleProp.name}`;
        await navigator.share({
          title: "Candelei - Candle by " + candleObj.name,
          text: candleObj.wish,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing the URL: ", error);
      }
    } else {
      console.log("Web share not supported");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSupport = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    if (isSupporting || hasSupported) return;
    
    setIsSupporting(true);
    try {
      const response = await fetch(`/api/candle/${candleProp.name}`, {
        method: "PATCH",
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupport(data.support);
        
        // Save to localStorage with timestamp
        const supportedData = JSON.parse(localStorage.getItem("candelei-supported-candles") || "{}");
        supportedData[candleProp.name] = Date.now();
        localStorage.setItem("candelei-supported-candles", JSON.stringify(supportedData));
        setHasSupported(true);
      }
    } catch (error) {
      console.error("Error supporting candle:", error);
    } finally {
      setIsSupporting(false);
    }
  };

  const formatSupportCount = (count: number) => {
    return count > 99 ? "99+" : count.toString();
  };

  return (
    <>
      {candleObj && (
        <div
          className={`
            flex flex-col justify-end w-[300px] h-[350px] self-center 
            ${candleProp.navigate && "cursor-pointer"} 
            glass-light rounded-t-full rounded-b-xl
            transition-all duration-300 ease-out
            hover:scale-105 hover:glass
            glow-warm-hover
            overflow-hidden
            group
            active:scale-95
            relative
          `          }
          onClick={() => {
            if (candleProp.navigate && candleProp.onCandleClick) {
              candleProp.onCandleClick();
            }
          }}
        >
          <Candle height={100 - candleObj.height} color={candleObj.color} />

          <div className="flex flex-col items-center w-full glass px-4 py-3 mt-2 rounded-b-xl transition-all duration-300 group-hover:bg-opacity-80">
            {candleProp.navigate && (
              <p className="text-base md:text-lg font-medium text-center mb-2 line-clamp-1 leading-snug overflow-hidden">
                {candleObj.wish}
              </p>
            )}
            <p className="text-sm md:text-base text-gray-300 mb-1 truncate max-w-full">
              {t("candle.by")} <span className="text-amber-300 font-medium">{candleObj.name}</span> 
              <span className="text-gray-400"> ({candleObj.country})</span>
            </p>
            <p className="text-xs text-gray-400 mb-3 truncate max-w-full">
              {t("candle.on")} {candleObj.date}
            </p>

            {/* Action buttons row */}
            <div className="flex justify-between w-full pt-2 border-t border-gray-600 border-opacity-30">
              {/* Support button */}
              <button
                className={`
                  flex items-center gap-1.5
                  px-2.5 py-1.5
                  rounded-full
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
                  ${hasSupported 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:bg-amber-500 hover:bg-opacity-20 hover:scale-110 opacity-90 hover:opacity-100'
                  }
                  ${isSupporting ? 'opacity-50' : ''}
                `}
                onClick={onSupport}
                disabled={isSupporting || hasSupported}
                title={hasSupported ? `${t("candle.support.already")} (${support} ${t("candle.support.count")})` : `${t("candle.support")} (${support} ${t("candle.support.count")})`}
              >
                <span className="text-lg">{hasSupported ? '✓' : '🔥'}</span>
                <span className="text-xs font-semibold text-white">
                  {formatSupportCount(support)}
                </span>
              </button>

              {/* Share button */}
              <button
                className="
                  p-2 rounded-full
                  hover:bg-amber-500 hover:bg-opacity-20
                  transition-all duration-200
                  hover:scale-110
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                "
                onClick={onShare}
                title={t("candle.share")}
              >
                <svg
                  fill="#ffffff"
                  height="20px"
                  width="20px"
                  version="1.1"
                  id="Capa_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 481.6 481.6"
                  xmlSpace="preserve"
                  stroke="#ffffff"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <g>
                      <path d="M381.6,309.4c-27.7,0-52.4,13.2-68.2,33.6l-132.3-73.9c3.1-8.9,4.8-18.5,4.8-28.4c0-10-1.7-19.5-4.9-28.5l132.2-73.8 c15.7,20.5,40.5,33.8,68.3,33.8c47.4,0,86.1-38.6,86.1-86.1S429,0,381.5,0s-86.1,38.6-86.1,86.1c0,10,1.7,19.6,4.9,28.5 l-132.1,73.8c-15.7-20.6-40.5-33.8-68.3-33.8c-47.4,0-86.1,38.6-86.1,86.1s38.7,86.1,86.2,86.1c27.8,0,52.6-13.3,68.4-33.9 l132.2,73.9c-3.2,9-5,18.7-5,28.7c0,47.4,38.6,86.1,86.1,86.1s86.1-38.6,86.1-86.1S429.1,309.4,381.6,309.4z M381.6,27.1 c32.6,0,59.1,26.5,59.1,59.1s-26.5,59.1-59.1,59.1s-59.1-26.5-59.1-59.1S349.1,27.1,381.6,27.1z M100,299.8 c-32.6,0-59.1-26.5-59.1-59.1s26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1S132.5,299.8,100,299.8z M381.6,454.5 c-32.6,0-59.1-26.5-59.1-59.1c0-32.6,26.5-59.1,59.1-59.1s59.1,26.5,59.1,59.1C440.7,428,414.2,454.5,381.6,454.5z"></path>
                    </g>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
