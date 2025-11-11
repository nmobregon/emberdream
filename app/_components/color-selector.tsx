"use client";

import { useState, useRef, useEffect } from "react";

const CANDLE_COLORS = [
  { name: "Classic Orange", color: "#ff9224" },
  { name: "Warm Red", color: "#e63946" },
  { name: "Deep Purple", color: "#8b5cf6" },
  { name: "Ocean Blue", color: "#3b82f6" },
  { name: "Forest Green", color: "#10b981" },
  { name: "Sunset Pink", color: "#ec4899" },
  { name: "Golden Yellow", color: "#fbbf24" },
  { name: "Royal Violet", color: "#6366f1" },
  { name: "Mystic Teal", color: "#14b8a6" },
  { name: "Cherry Red", color: "#dc2626" },
  { name: "Lavender", color: "#a78bfa" },
  { name: "Mint Green", color: "#34d399" },
];

export const ColorSelector = ({
  value,
  onChange,
  tabIndex,
}: {
  value: string;
  onChange: (color: string) => void;
  tabIndex?: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedColorObj = CANDLE_COLORS.find((c) => c.color === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={tabIndex}
        className="
          w-full px-5 py-4 rounded-xl
          bg-black bg-opacity-50
          border-2 border-gray-600 border-opacity-50
          text-white text-base
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
          focus:bg-opacity-60 focus:scale-[1.02]
          transition-all duration-300
          hover:border-amber-500 hover:border-opacity-50
          flex items-center justify-between gap-3
        "
      >
        {selectedColorObj ? (
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full border-2 border-white border-opacity-30 shadow-lg"
              style={{ backgroundColor: selectedColorObj.color }}
            />
            <span>{selectedColorObj.name}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select a candle color...</span>
        )}
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-2 rounded-xl
            bg-black bg-opacity-90
            backdrop-filter backdrop-blur-xl
            border-2 border-amber-500 border-opacity-30
            shadow-2xl shadow-amber-500/20
            max-h-80 overflow-y-auto
            custom-scrollbar
            animate-dropdown-appear
          "
        >
          <div className="grid grid-cols-2 gap-2 p-3">
            {CANDLE_COLORS.map((colorObj) => (
              <button
                key={colorObj.color}
                type="button"
                onClick={() => handleSelect(colorObj.color)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  hover:bg-amber-500 hover:bg-opacity-20
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50
                  ${
                    value === colorObj.color
                      ? "bg-amber-500 bg-opacity-30 ring-2 ring-amber-500 ring-opacity-50"
                      : ""
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-white border-opacity-30 shadow-lg flex-shrink-0"
                  style={{ backgroundColor: colorObj.color }}
                />
                <span className="text-white text-sm font-medium text-left">
                  {colorObj.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

