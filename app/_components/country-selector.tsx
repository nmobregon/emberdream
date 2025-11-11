import { useEffect, useRef, useState } from "react";
import { countries } from "../_data/countries";

interface CountrySelectorProps {
  value: string;
  onChange: (code: string) => void;
  placeholder: string;
  tabIndex?: number;
}

// Convert country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

export const CountrySelector = ({
  value,
  onChange,
  placeholder,
  tabIndex,
}: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.code === value);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when search changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  // Scroll to highlighted item
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearch("");
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          handleSelect(filteredCountries[highlightedIndex].code);
        }
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={tabIndex}
        className="
          w-full px-5 py-4 rounded-xl
          bg-black bg-opacity-50
          border-2 border-gray-600 border-opacity-50
          text-white text-base text-left
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
          focus:bg-opacity-60 focus:scale-[1.02]
          transition-all duration-300
          hover:border-amber-500 hover:border-opacity-50
          cursor-pointer
          flex items-center justify-between gap-3
        "
      >
        <span className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <span className="text-2xl">
                {getFlagEmoji(selectedCountry.code)}
              </span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <svg
          className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="
            absolute z-50 w-full mt-2
            bg-black bg-opacity-95 backdrop-blur-xl
            border-2 border-amber-500 border-opacity-30
            rounded-xl shadow-2xl shadow-amber-500/20
            overflow-hidden
            animate-dropdown-appear
          "
        >
          <div className="p-3 border-b border-amber-500 border-opacity-20">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search countries..."
              className="
                w-full px-4 py-2 rounded-lg
                bg-black bg-opacity-50
                border border-gray-600 border-opacity-50
                text-white text-sm placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                transition-all duration-200
              "
            />
          </div>
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto custom-scrollbar"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-4 py-3 text-left
                    flex items-center gap-3
                    transition-all duration-150
                    ${
                      index === highlightedIndex
                        ? "bg-amber-500 bg-opacity-20 text-amber-200"
                        : "text-white hover:bg-amber-500 hover:bg-opacity-10"
                    }
                    ${value === country.code ? "bg-amber-500 bg-opacity-30" : ""}
                  `}
                >
                  <span className="text-2xl">{getFlagEmoji(country.code)}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

