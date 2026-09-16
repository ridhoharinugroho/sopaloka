"use client";

import React, { useState, useEffect } from "react";
import { MapPin, X, ChevronDown, ArrowUpDown, Navigation } from "lucide-react";
import { useSearchFilter, UseSearchFilterProps } from "./hooks/useSearchFilter";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from "./components/FilterBar";
import { ListingGrid } from "./components/ListingGrid";
import { LocationPicker } from "./components/LocationPicker";
import type { ListingModel } from "../../domain/listing/listing.contract";

export interface SearchFilterFeatureProps extends UseSearchFilterProps {
  onListingClick?: (listing: ListingModel) => void;
  categorySlot?: React.ReactNode;
  region?: string;
  onRegionChange?: (reg: string) => void;
  className?: string;
}

const SORT_OPTIONS = [
  { id: "newest",     label: "Terbaru" },
  { id: "nearest",   label: "Terdekat" },
  { id: "price_low", label: "Termurah" },
  { id: "price_high",label: "Termahal" },
  { id: "views",     label: "Terpopuler" },
];

export const SearchFilterFeature: React.FC<SearchFilterFeatureProps> = ({
  initialListings = [],
  category,
  onListingClick,
  categorySlot,
  region,
  onRegionChange,
  className = "",
}) => {
  const [selectedSort, setSelectedSort] = useState("newest");

  const {
    filterState,
    filteredListings,
    updateSearchQuery,
    updateFilter,
    resetFilters,
  } = useSearchFilter({ initialListings, category });

  // --- Location State ---
  const [activeDistCode, setActiveDistCode]   = useState("");
  const [activeDistName, setActiveDistName]   = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [modalProv, setModalProv] = useState("");
  const [modalReg,  setModalReg]  = useState("");
  const [modalDist, setModalDist] = useState("");

  // Load saved location from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCode = localStorage.getItem("sopaloka_nearest_dist")      || "";
    const savedName = localStorage.getItem("sopaloka_nearest_dist_name") || "";
    if (savedCode && savedName) {
      setActiveDistCode(savedCode);
      setActiveDistName(savedName);
    }
  }, []);

  // --- Nearest Distance Calculation ---
  const applyNearest = async (distCode: string) => {
    updateFilter({ isNearest: true, sortBy: "nearest" });
    const { supabase }            = await import("../../lib/supabase");
    const { fetchNearestDistances } = await import("../../services/listingService");
    if (!supabase) return;
    const cleanCode = distCode.replace(/\./g, "");
    const { data, error } = await supabase
      .from("districts")
      .select("latitude, longitude")
      .eq("id", cleanCode)
      .single();
    if (error || !data?.latitude) {
      console.error("[applyNearest] district not found:", cleanCode, error);
      return;
    }
    const distMap = await fetchNearestDistances(data.latitude, data.longitude);
    updateFilter({ nearestDistances: distMap });
  };

  // --- Sort handler (NO double-click modal) ---
  const handleSelectSort = (srt: string) => {
    setSelectedSort(srt);
    if (srt === "nearest") {
      if (activeDistCode) {
        applyNearest(activeDistCode);
      } else {
        // No location saved yet → open modal, remember user intent
        setShowLocationModal(true);
      }
    } else {
      updateFilter({ isNearest: false, sortBy: srt });
    }
  };

  // --- Save location from modal (does NOT mutate user profile) ---
  const handleSaveLocation = () => {
    if (!modalDist) {
      alert("Pilih kecamatan terlebih dahulu!");
      return;
    }
    const districtName =
      modalDist; // name will be set via LocationPicker callback below
    if (typeof window !== "undefined") {
      localStorage.setItem("sopaloka_nearest_dist",      activeDistCode || modalDist);
      localStorage.setItem("sopaloka_nearest_dist_name", activeDistName || modalDist);
    }
    setActiveDistCode(modalDist);
    setShowLocationModal(false);

    // If user was trying to sort by nearest, activate it now
    if (selectedSort === "nearest") {
      applyNearest(modalDist);
    }
  };

  // Proper name saved from LocationPicker callback
  const handleDistrictChange = (code: string, name: string) => {
    setModalDist(code);
    setActiveDistName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("sopaloka_nearest_dist_name", name);
    }
  };

  // --- Reset location ---
  const handleResetLocation = () => {
    setActiveDistCode("");
    setActiveDistName("");
    setModalProv("");
    setModalReg("");
    setModalDist("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("sopaloka_nearest_dist");
      localStorage.removeItem("sopaloka_nearest_dist_name");
    }
    updateFilter({ isNearest: false, nearestDistances: undefined, sortBy: "newest" });
    setSelectedSort("newest");
  };

  // region prop sync (legacy compat)
  useEffect(() => {
    if (region !== undefined) updateFilter({ regionId: region });
  }, [region, updateFilter]);

  const handleFilterChange = (updates: Partial<typeof filterState>) => {
    updateFilter(updates);
  };

  return (
    <div className={`space-y-1 sm:space-y-1.5 ${className}`.trim()}>

      {/* ── Location Modal ─────────────────────────────────────────── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-6 pb-8 sm:pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                  <Navigation className="w-3.5 h-3.5 text-red-600" />
                </span>
                <h3 className="text-[15px] font-bold text-gray-900">Lokasi Anda</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-5 pl-9">
              Pilih kecamatan untuk menampilkan barang terdekat dari Anda.
            </p>

            {/* Location Picker */}
            <div className="mb-6">
              <LocationPicker
                showDistrict={true}
                provinceCode={modalProv}
                regencyCode={modalReg}
                districtCode={modalDist}
                onProvinceChange={(v) => { setModalProv(v); setModalReg(""); setModalDist(""); }}
                onRegencyChange={(v)  => { setModalReg(v);  setModalDist(""); }}
                onDistrictChange={handleDistrictChange}
                className="flex-col !items-stretch w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveLocation}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 active:scale-95 transition-all"
              >
                Simpan & Cari
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar: Location (left) + Sort Dropdown (right) ───────── */}
      {categorySlot ? (
        <>
          {/* Location + Sort Row */}
          <div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 lg:px-6 py-1">

            {/* Left: Location Pill */}
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                id="location-picker-btn"
                onClick={() => setShowLocationModal(true)}
                className={`flex items-center gap-1.5 h-7 pl-2 pr-2.5 rounded-lg border text-[11px] font-semibold transition-all shadow-xs max-w-[160px] sm:max-w-[200px] truncate ${
                  activeDistName
                    ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {activeDistName ? activeDistName : "Pilih Lokasi"}
                </span>
              </button>

              {/* Reset button */}
              {activeDistName && (
                <button
                  onClick={handleResetLocation}
                  title="Reset Lokasi"
                  className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500 text-slate-400 transition-colors flex-shrink-0"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            {/* Right: Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
              </span>
              <select
                id="sort-dropdown"
                value={selectedSort}
                onChange={(e) => handleSelectSort(e.target.value)}
                className="h-7 pl-7 pr-6 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 appearance-none hover:bg-slate-50 transition-colors"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.id === "nearest" ? "📍 " : ""}{opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </div>

          {/* Category Pills Slot */}
          {categorySlot}
        </>
      ) : (
        <div className="space-y-3 mb-4">
          <SearchBar
            value={filterState.searchQuery}
            onChange={updateSearchQuery}
            suggestions={Array.from(new Set(filteredListings.map(l => l.title))).slice(0, 5)}
          />
          <FilterBar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>
      )}

      {/* ── Listing Grid ────────────────────────────────────────────── */}
      <ListingGrid
        listings={filteredListings}
        onListingClick={(listing) => {
          // [AI Telemetry Tracker] Jika user sedang mencari sesuatu lalu mengklik barang, laporkan ke DB
          if (filterState.searchQuery && filterState.searchQuery.trim().length >= 3) {
            import("../../services/listingService").then(({ recordSearchTelemetry }) => {
              recordSearchTelemetry(filterState.searchQuery, listing.id);
            });
          }
          // Panggil fungsi klik bawaan dari props
          onListingClick?.(listing);
        }}
      />
    </div>
  );
};
