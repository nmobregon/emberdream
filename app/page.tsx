"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { CandleItem } from "./_components/candle-item";
import { CandlePlaceholder } from "./_components/candle-placeholder";
import { NewCandleDialog } from "./_components/new-candle-dialog";
import { CandleDrawer } from "./_components/candle-drawer";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLanguage } from "./_contexts/language-context";

const CANDLES_PER_PAGE = 20;

const getCandles = async (page: number = 1) => {
  const res = await fetch(`api/candle?page=${page}&limit=${CANDLES_PER_PAGE}`);
  const data = await res.json();
  return data;
};

export default function Home() {
  const [candles, setCandles] = useState<Record<string, string>>({});
  const [windowWidth, setWindowWidth] = useState(0);
  const [selectedCandle, setSelectedCandle] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const openDialogRef = useRef<(() => void) | null>(null);
  const { t, isLanguageLoaded } = useLanguage();
  const tourInitializedRef = useRef(false);
  const isInitialLoad = useRef(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detect window width for responsive placeholder count
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial candles
  useEffect(() => {
    (async () => {
      setIsInitialLoading(true);
      try {
        const data = await getCandles(1);
        setCandles(data.candles || {});
        setHasMore(data.pagination?.hasMore ?? false);
        setCurrentPage(1);
        
        // Check for hash in URL on initial load
        if (isInitialLoad.current && window.location.hash) {
          const candleName = window.location.hash.substring(1); // Remove the #
          if (data.candles?.[candleName]) {
            setSelectedCandle(candleName);
          }
          isInitialLoad.current = false;
        }
      } catch (error) {
        console.error("Error loading candles:", error);
      } finally {
        setIsInitialLoading(false);
      }
    })();
  }, []);

  // Load more candles function
  const loadMoreCandles = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getCandles(nextPage);
      
      if (data.candles) {
        setCandles((prev) => ({ ...prev, ...data.candles }));
        setHasMore(data.pagination?.hasMore ?? false);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more candles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, hasMore, isLoading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    if (!currentRef || isInitialLoading) return;

    // Clean up previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading && !isInitialLoading) {
          loadMoreCandles();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before reaching the bottom
      }
    );

    observer.observe(currentRef);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, isLoading, isInitialLoading, loadMoreCandles]);

  const onCandleCreated = async () => {
    // Reset to first page and reload
    setIsInitialLoading(true);
    try {
      const data = await getCandles(1);
      setCandles(data.candles || {});
      setHasMore(data.pagination?.hasMore ?? false);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error reloading candles:", error);
    } finally {
      setIsInitialLoading(false);
    }
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

  // Calculate how many placeholders to show (always show when below minimum)
  const candleCount = Object.keys(candles).length;
  const minCandles = windowWidth < 1024 ? 4 : windowWidth < 1280 ? 6 : 8; // <1024: 4, <1280: 6, >=1280: 8
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
              candle={candles[candleKey]}
              key={candleKey}
              name={candleKey}
              navigate
              onCandleClick={() => handleCandleSelect(candleKey)}
            />
          ))}
          
          {/* Placeholders (show when candle count is below minimum) */}
          {Array.from({ length: placeholderCount }).map((_, index) => (
            <CandlePlaceholder 
              key={`placeholder-${index}`} 
              onClick={handlePlaceholderClick}
            />
          ))}
        </div>
        
        {/* Loading indicator and infinite scroll trigger */}
        {!isInitialLoading && (
          <div ref={loadMoreRef} className="w-full py-8 flex justify-center">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                <span>{t("loading")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
