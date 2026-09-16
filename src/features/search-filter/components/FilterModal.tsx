"use client";

import React, { useState, useMemo } from "react";
import { X, SlidersHorizontal, MapPin, Navigation, Tag, Check, RotateCcw, ChevronDown, Map, Grid } from "lucide-react";
import { PROVINCES, getRegenciesByProvince } from "../../../lib/regions";

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  selectedCategory: string;
  onApply: (region: string, category: string) => void;
  className?: string;
}

const CATEGORY_OPTIONS = [
  { id: "all", name: "Semua Kategori" },
  { id: "elektronik", name: "Elektronik & Gadget" },
  { id: "kendaraan", name: "Kendaraan & Otomotif" },
  { id: "perabot", name: "Perabot & Rumah Tangga" },
  { id: "pakaian", name: "Pakaian & Aksesoris" },
  { id: "kuliner", name: "Makanan & Minuman" },
  { id: "bayi-anak", name: "Perlengkapan Bayi & Anak" },
  { id: "pertukangan", name: "Pertukangan / Bahan Bangunan" },
  { id: "hobi", name: "Hobi, Musik & Olahraga" },
  { id: "hewan", name: "Hewan & Perlengkapan" },
  { id: "alat-sekolah", name: "Peralatan Sekolah" },
  { id: "perawatan-diri", name: "Perawatan Diri" },
  { id: "properti", name: "Properti" },
  { id: "jasa", name: "Jasa" },
  { id: "lainnya", name: "Lain-lain / Aneka Barang" },
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  selectedRegion: initialRegion,
  selectedCategory: initialCategory,
  onApply,
  className = "",
}) => {
  const [tempProvince, setTempProvince] = useState("all"); // Default Semua Provinsi
  const [tempRegion, setTempRegion] = useState(initialRegion || "all");
  const [tempCategory, setTempCategory] = useState(initialCategory || "all");

  const regencies = useMemo(() => getRegenciesByProvince(tempProvince), [tempProvince]);

  React.useEffect(() => {
    if (isOpen) {
      setTempProvince("all");
      setTempRegion(initialRegion || "all");
      setTempCategory(initialCategory || "all");
    }
  }, [isOpen, initialRegion, initialCategory]);

  if (!isOpen) return null;

  const handleReset = () => {
    setTempProvince("all");
    setTempRegion("all");
    setTempCategory("all");
  };

  const handleSave = () => {
    onApply(tempRegion, tempCategory);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 p-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-900/60 border border-rose-700/60 flex items-center justify-center text-amber-300">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Filter Wilayah & Kategori
              </h3>
              <p className="text-[10.5px] text-slate-300">
                Pilih wilayah dan kategori barang yang ingin dipantau
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
            aria-label="Tutup Filter"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* 1. Filter Provinsi */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">Pilih Provinsi</label>
            <div className="relative w-full h-10 px-3 py-2 bg-slate-50 border border-slate-300 hover:border-rose-900 rounded-xl flex items-center justify-between text-slate-800 transition-colors focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900">
              <div className="flex items-center gap-2.5 min-w-0 truncate pointer-events-none">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-900 flex items-center justify-center flex-shrink-0">
                  <Map className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-semibold text-slate-800 text-xs">
                  {tempProvince === "all" ? "Semua Provinsi" : (PROVINCES.find(p => p.code === tempProvince)?.name || "Pilih Provinsi")}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
              
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                value={tempProvince}
                onChange={(e) => {
                  setTempProvince(e.target.value);
                  setTempRegion("all"); // Reset region when province changes
                }}
              >
                <option value="all">Semua Provinsi</option>
                {PROVINCES.map(prov => (
                  <option key={prov.id} value={prov.code}>{prov.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Filter Wilayah (Kabupaten/Kota) */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">Kabupaten / Kota</label>
            <div className="relative w-full h-10 px-3 py-2 bg-slate-50 border border-slate-300 hover:border-rose-900 rounded-xl flex items-center justify-between text-slate-800 transition-colors focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900">
              <div className="flex items-center gap-2.5 min-w-0 truncate pointer-events-none">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-semibold text-slate-800 text-xs">
                  {tempRegion === "all" ? "Semua Wilayah" : regencies.find(r => r.id === tempRegion)?.name || "Pilih Wilayah"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
              
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                value={tempRegion}
                onChange={(e) => setTempRegion(e.target.value)}
              >
                <option value="all">Semua Wilayah</option>
                {regencies.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Filter Kategori */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">Kategori Barang</label>
            <div className="relative w-full h-10 px-3 py-2 bg-slate-50 border border-slate-300 hover:border-rose-900 rounded-xl flex items-center justify-between text-slate-800 transition-colors focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900">
              <div className="flex items-center gap-2.5 min-w-0 truncate pointer-events-none">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-900 flex items-center justify-center flex-shrink-0">
                  <Grid className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-semibold text-slate-800 text-xs">
                  {CATEGORY_OPTIONS.find(c => c.id === tempCategory)?.name || "Pilih Kategori"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
              
              <select 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-black text-white bg-rose-900 hover:bg-rose-800 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Terapkan Filter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
