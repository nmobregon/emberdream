import { FormEvent, useLayoutEffect, useRef, useState, useCallback, useEffect } from "react";

import Form from "next/form";
import Image from "next/image";
import { useLanguage } from "../_contexts/language-context";
import { CountrySelector } from "./country-selector";
import { ColorSelector } from "./color-selector";
import { countries } from "../_data/countries";

export const NewCandleDialog = ({
  candleCreated,
  childRendered,
  onMount,
}: {
  candleCreated: VoidFunction;
  childRendered: VoidFunction;
  onMount?: (openDialog: () => void) => void;
}) => {
  const { t } = useLanguage();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialog = useRef<any>(undefined);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ff9224"); // Default to classic orange
  const [countryAutoDetected, setCountryAutoDetected] = useState(false);

  const openDialog = useCallback(() => {
    setDialogOpened(true);
  }, []);
  
  const closeDialog = useCallback(() => {
    setDialogOpened(false);
    setSelectedCountry("");
    setSelectedColor("#ff9224"); // Reset to default
    setCountryAutoDetected(false); // Allow auto-detection on next open
  }, []);

  useLayoutEffect(() => {
    childRendered();
    if (onMount) {
      onMount(openDialog);
    }
  }, [childRendered, onMount, openDialog]);

  // Auto-detect country from browser locale
  useEffect(() => {
    if (!countryAutoDetected) {
      try {
        // Try to get country code from locale (e.g., "en-US" -> "US")
        const locale = navigator.language;
        const countryCode = locale.split("-")[1]?.toUpperCase();
        
        if (countryCode) {
          // Check if the country code exists in our countries list
          const countryExists = countries.some(c => c.code === countryCode);
          if (countryExists) {
            setSelectedCountry(countryCode);
            setCountryAutoDetected(true);
          }
        }
      } catch (e) {
        console.error("Could not auto-detect country:", e);
      }
    }
  }, [countryAutoDetected]);

  useLayoutEffect(() => {
    if (dialogOpened) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialogOpened]);

  const newCandle = async (event: FormEvent) => {
    event.preventDefault();
    const {
      target: { name, wish },
    } = event as unknown as {
      target: {
        name: HTMLInputElement;
        wish: HTMLInputElement;
      };
    };

    try {
      const response = await fetch("api/candle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.value,
          wish: wish.value,
          country: selectedCountry,
          color: selectedColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60;
          alert(
            `${data.error || "Too many requests"} Please try again in ${retryAfter} seconds.`
          );
          return;
        }
        
        // Handle validation errors
        if (response.status === 400) {
          const errorMsg = data.details 
            ? `${data.error}\n${data.details.join("\n")}`
            : data.error || "Validation failed";
          alert(errorMsg);
          return;
        }
        
        // Other errors
        alert(data.error || "Failed to create candle. Please try again.");
        return;
      }

      // Success
      candleCreated();
      setDialogOpened(false);
      setSelectedCountry("");
      setSelectedColor("#ff9224"); // Reset to default
      setCountryAutoDetected(false); // Allow auto-detection on next open
    } catch (error) {
      console.error("Error creating candle:", error);
      alert("Failed to create candle. Please check your connection and try again.");
    }
  };

  return (
    <>
      <button
        className={`
            fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50
            rounded-full text-2xl font-bold 
            bg-gradient-to-br from-amber-600 to-orange-700
            text-white w-14 h-14 md:w-20 md:h-20 
            flex items-center justify-center
            transition-all duration-300 ease-out
            hover:scale-110 hover:from-amber-500 hover:to-orange-600
            pulse-glow
            focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50
        `}
        title={t("dialog.fab.title")}
        id="new_candle_btn"
        tabIndex={0}
        onClick={openDialog}
      >
        <Image
          src="/candelei-icon.png"
          alt="Candelei logo"
          width={50}
          height={50}
          className="w-8 h-8 md:w-[50px] md:h-[50px] drop-shadow-lg"
        />
      </button>
      <dialog
        ref={dialog}
        className="glass backdrop-blur-xl rounded-3xl shadow-2xl p-0 w-full max-w-lg border border-amber-500 border-opacity-20 animate-dialog-appear"
      >
        <div className="relative flex justify-between items-center p-6 border-b border-amber-500 border-opacity-20 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-flicker">🕯️</span>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 bg-clip-text text-transparent">
              {t("dialog.title")}
            </h2>
          </div>
          <button
            className="
              text-gray-400 hover:text-white 
              text-2xl font-bold 
              w-10 h-10 flex items-center justify-center
              rounded-full hover:bg-amber-500 hover:bg-opacity-20
              transition-all duration-300 hover:rotate-90
              focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
            "
            onClick={closeDialog}
          >
            ✕
          </button>
        </div>
        <Form
          action="/"
          onSubmit={newCandle}
          className="flex flex-col p-6 md:p-8 gap-6 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent"
        >
          <div className="flex flex-col gap-3 group">
            <label
              className="font-semibold text-amber-200 text-base flex items-center gap-2 transition-all duration-200 group-focus-within:text-amber-300 group-focus-within:translate-x-1"
            >
              <span className="text-xl">🌍</span>
              {t("dialog.country")}
            </label>
            <CountrySelector
              value={selectedCountry}
              onChange={setSelectedCountry}
              placeholder={t("dialog.country.placeholder")}
              tabIndex={1}
            />
          </div>
          <div className="flex flex-col gap-3 group">
            <label
              className="font-semibold text-amber-200 text-base flex items-center gap-2 transition-all duration-200 group-focus-within:text-amber-300 group-focus-within:translate-x-1"
            >
              <span className="text-xl">🎨</span>
              {t("dialog.color")}
            </label>
            <ColorSelector
              value={selectedColor}
              onChange={setSelectedColor}
              tabIndex={2}
            />
          </div>
          <div className="flex flex-col gap-3 group">
            <label 
              className="font-semibold text-amber-200 text-base flex items-center gap-2 transition-all duration-200 group-focus-within:text-amber-300 group-focus-within:translate-x-1" 
              htmlFor="name"
            >
              <span className="text-xl">👤</span>
              {t("dialog.name")}
            </label>
            <input
              className="
                w-full px-5 py-4 rounded-xl
                bg-black bg-opacity-50
                border-2 border-gray-600 border-opacity-50
                text-white text-base placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                focus:bg-opacity-60 focus:scale-[1.02]
                transition-all duration-300
                hover:border-amber-500 hover:border-opacity-50
              "
              type="text"
              name="name"
              id="name"
              placeholder={t("dialog.name.placeholder")}
              tabIndex={3}
              required
            />
          </div>
          <div className="flex flex-col gap-3 group">
            <label 
              className="font-semibold text-amber-200 text-base flex items-center gap-2 transition-all duration-200 group-focus-within:text-amber-300 group-focus-within:translate-x-1" 
              htmlFor="wish"
            >
              <span className="text-xl">✨</span>
              {t("dialog.wish")}
            </label>
            <input
              className="
                w-full px-5 py-4 rounded-xl
                bg-black bg-opacity-50
                border-2 border-gray-600 border-opacity-50
                text-white text-base placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                focus:bg-opacity-60 focus:scale-[1.02]
                transition-all duration-300
                hover:border-amber-500 hover:border-opacity-50
              "
              type="text"
              name="wish"
              id="wish"
              placeholder={t("dialog.wish.placeholder")}
              tabIndex={4}
              required
            />
          </div>
          <button
            className="
              w-full mt-4 px-6 py-4 rounded-xl
              bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600
              text-white font-bold text-lg
              hover:from-amber-500 hover:via-orange-400 hover:to-amber-500
              hover:scale-[1.03]
              active:scale-[0.98]
              transition-all duration-300 ease-out
              shadow-lg shadow-amber-500/30
              hover:shadow-2xl hover:shadow-amber-500/50
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent
              relative overflow-hidden
              group
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg
            "
            type="submit"
            tabIndex={5}
            disabled={!selectedCountry}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-xl group-hover:scale-125 transition-transform duration-300">✨</span>
              {t("dialog.submit")}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%] group-hover:transition-transform group-hover:duration-700"></span>
          </button>
        </Form>
      </dialog>
    </>
  );
};
