import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { NavBrand } from "./NavBrand";
import { NavActions } from "./NavActions";

export interface HeaderNavProps {
  notificationCount?: number;
  onNotificationClick?: () => void;
  onFavoritesClick?: () => void;
  onFilterClick?: () => void;
  onCreateListingClick?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLogoClick?: () => void;
  suggestions?: string[];
  className?: string;
}

const DEFAULT_POPULAR_SUGGESTIONS = [
  "Sepeda",
  "Motor",
  "HP Android",
  "iPhone",
  "Sofa",
  "Meja Belajar",
  "Laptop",
  "Helm",
  "Kipas Angin",
  "Televisi",
];

export const HeaderNav: React.FC<HeaderNavProps> = ({
  notificationCount = 0,
  onNotificationClick,
  onFavoritesClick,
  onFilterClick,
  onCreateListingClick,
  onSearchSubmit,
  onLogoClick,
  suggestions = DEFAULT_POPULAR_SUGGESTIONS,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchSubmit?.(val);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchSubmit?.("");
    setIsFocused(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(searchQuery);
    setIsFocused(false);
    
    // Menutup keyboard HP setelah submit
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSearchSubmit?.(suggestion);
    setIsFocused(false);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const allSuggestions = Array.from(
    new Set([...suggestions, ...DEFAULT_POPULAR_SUGGESTIONS])
  );

  const filteredSuggestions = searchQuery.trim()
    ? allSuggestions
        .filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .slice(0, 6)
    : [];

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  return (
    <div
      ref={containerRef}
      id="sticky-top-app-wrapper"
      className={`sticky-top-app-bar sticky top-0 z-30 w-full bg-[#ffffff] shadow-xs min-h-[88px] md:min-h-[64px] flex flex-col justify-center border-b border-rose-100/60 ${className}`.trim()}
    >
      <header className="w-full max-w-full overflow-visible">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-4 lg:px-6">
          {/* Row 1: Brand Logo, Desktop Search, & Action Buttons */}
          <div className="flex items-center justify-between h-12 sm:h-16 gap-2 sm:gap-4 pt-1.5 pb-0.5 sm:py-1">
            {/* Brand Logo & Header */}
            <NavBrand onLogoClick={onLogoClick} />

            {/* Desktop Search Bar (Hidden on Mobile) */}
            <div id="desktop-search-container" className="hidden md:flex flex-1 max-w-lg mx-2 lg:mx-4 relative">
              <form onSubmit={handleFormSubmit} role="search" className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  id="desktop-search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Cari sepeda, HP, motor, sofa terdekat..."
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full pl-10 pr-10 py-2.5 bg-white text-slate-800 border border-slate-200 rounded-full text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white shadow-xs transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Desktop Autocomplete Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <ul className="py-1">
                    {filteredSuggestions.map((item, idx) => (
                      <li
                        key={idx}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-4 py-2.5 hover:bg-rose-50/70 cursor-pointer text-sm text-slate-700 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Header Action Controls */}
            <NavActions
              notificationCount={notificationCount}
              onNotificationClick={onNotificationClick}
              onFavoritesClick={onFavoritesClick}
              onFilterClick={onFilterClick}
              onCreateListingClick={onCreateListingClick}
            />
          </div>

          {/* Row 2: Mobile Search Bar (Positioned directly below brand header on mobile) */}
          <div id="mobile-search-container" className="md:hidden pt-0.5 pb-2 relative">
            <form onSubmit={handleFormSubmit} role="search" className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                id="mobile-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsFocused(true)}
                placeholder="Cari barang terdekat..."
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                className="w-full pl-10 pr-8 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white shadow-xs [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Mobile Autocomplete Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <ul className="py-1">
                  {filteredSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-3.5 py-2.5 hover:bg-rose-50/70 active:bg-rose-100 cursor-pointer text-xs sm:text-sm text-slate-700 flex items-center gap-2.5 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};


