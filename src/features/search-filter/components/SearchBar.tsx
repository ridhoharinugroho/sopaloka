import React, { useState, useRef, useEffect } from "react";
import { Button } from "../../../components/ui/Button";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  suggestions?: string[];
  onSelectSuggestion?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Cari barang, motor, HP, elektronik...",
  onClear,
  className = "",
  suggestions = [],
  onSelectSuggestion,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showSuggestions = isFocused && suggestions.length > 0 && value.trim().length > 0;

  return (
    <div ref={wrapperRef} className={`relative flex items-center w-full ${className}`.trim()}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        🔍
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
            setIsFocused(true);
          }}
          className="absolute right-14 text-xs font-semibold text-gray-400 hover:text-gray-600 px-1"
        >
          ✕
        </button>
      )}
      <Button
        variant="primary"
        size="sm"
        className="absolute right-1.5 rounded-lg px-3 py-1.5"
      >
        Cari
      </Button>

      {/* Autocomplete Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-y-auto py-1">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-center gap-3 transition-colors"
                onClick={() => {
                  if (onSelectSuggestion) onSelectSuggestion(suggestion);
                  else onChange(suggestion);
                  setIsFocused(false);
                }}
              >
                <span className="text-gray-400 text-xs">🔍</span>
                <span className="font-medium">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

