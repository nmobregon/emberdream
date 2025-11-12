"use client";
import { useEffect, useState, useRef } from "react";
import { CandleItem } from "./_components/candle-item";
import { CandlePlaceholder } from "./_components/candle-placeholder";
import { NewCandleDialog } from "./_components/new-candle-dialog";
import { CandleDrawer } from "./_components/candle-drawer";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLanguage } from "./_contexts/language-context";

const getCandles = async () => {
  const res = await fetch("api/candle");
  return res.json();
};

export default function Home() {
  const [candles, setCandles] = useState([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [selectedCandle, setSelectedCandle] = useState<string | null>(null);
  const openDialogRef = useRef<(() => void) | null>(null);
  const { t, isLanguageLoaded } = useLanguage();
  const tourInitializedRef = useRef(false);
  const isInitialLoad = useRef(true);

  // Detect window width for responsive placeholder count
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      const candles = await getCandles();
      setCandles(candles);
      
      // Check for hash in URL on initial load
      if (isInitialLoad.current && window.location.hash) {
        const candleName = window.location.hash.substring(1); // Remove the #
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((candles as any)[candleName]) {
          setSelectedCandle(candleName);
        }
        isInitialLoad.current = false;
      }
    })();
  }, []);

  const onCandleCreated = async () => {
    const candles = await getCandles();
    setCandles(candles);
  };

  const onChildRendered = () => {
    // We'll start the tour from useEffect instead
  };

  // Initialize tour after language is loaded
  useEffect(() => {
    if (!isLanguageLoaded || tourInitializedRef.current) return;
    if (localStorage.getItem("visited")) return;
    
    tourInitializedRef.current = true;
    
    const driverObj = driver({
      animate: true,
      showProgress: true,
      allowClose: true,
      allowKeyboardControl: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: t("tour.button.next"),
      prevBtnText: t("tour.button.previous"),
      doneBtnText: t("tour.button.done"),
      steps: [
        {
          popover: {
            title: t("tour.welcome.title"),
            description: t("tour.welcome.description"),
          },
        },
        {
          element: "#new_candle_btn",
          popover: {
            title: t("tour.spark.title"),
            description: t("tour.spark.description"),
            side: "left",
            align: "start",
          },
        },
        {
          element: "#donate_btn",
          popover: {
            title: t("tour.donate.title"),
            description: t("tour.donate.description"),
            side: "right",
            align: "start",
          },
        },
        {
          popover: {
            title: t("tour.farewell.title"),
            description: t("tour.farewell.description"),
          },
        },
      ],
    });
    
    driverObj.drive();
    localStorage.setItem("visited", "true");
  }, [isLanguageLoaded, t]);

  // Calculate how many placeholders to show
  const candleCount = Object.keys(candles).length;
  const minCandles = windowWidth < 640 ? 4 : 8; // Mobile: 4, Desktop: 8
  const placeholderCount = Math.max(0, minCandles - candleCount);

  const handlePlaceholderClick = () => {
    if (openDialogRef.current) {
      openDialogRef.current();
    }
  };

  const handleDialogMount = (openFn: () => void) => {
    openDialogRef.current = openFn;
  };

  const handleCandleSelect = (candleName: string) => {
    setSelectedCandle(candleName);
    window.location.hash = candleName;
  };

  const handleDrawerClose = () => {
    setSelectedCandle(null);
    // Clear the hash without page reload
    history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (hash && (candles as any)[hash]) {
        setSelectedCandle(hash);
      } else if (!hash) {
        setSelectedCandle(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [candles]);

  return (
    <>
      <NewCandleDialog
        candleCreated={onCandleCreated}
        childRendered={onChildRendered}
        onMount={handleDialogMount}
      />
      <CandleDrawer 
        candleName={selectedCandle} 
        onClose={handleDrawerClose} 
      />
      <div className="w-full py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-glow">
            🌟 {t("home.hero.title")}
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            {t("home.hero.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center w-full">
          {/* Real candles */}
          {Object.keys(candles).map((candleKey) => (
            <CandleItem
              candle={candles[candleKey as unknown as number]}
              key={candleKey}
              name={candleKey}
              navigate
              onCandleClick={() => handleCandleSelect(candleKey)}
            />
          ))}
          
          {/* Placeholders */}
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <CandlePlaceholder 
              key={`placeholder-${index}`} 
              onClick={handlePlaceholderClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}
