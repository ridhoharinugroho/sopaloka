import React from "react";
import { Tag, Eye } from "lucide-react";

export interface ListingGalleryProps {
  images: string[];
  title: string;
  activeIndex: number;
  onImageSelect: (index: number) => void;
  isDemo?: boolean;
  views?: number;
  isSold?: boolean;
  className?: string;
}

export const ListingGallery: React.FC<ListingGalleryProps> = ({
  images = [],
  title,
  activeIndex = 0,
  onImageSelect,
  isDemo = false,
  views,
  isSold = false,
  className = "",
}) => {
  const displayImages =
    images && images.length > 0
      ? images
      : ["https://via.placeholder.com/600x600?text=SOPALOKA"];

  const currentImage = displayImages[activeIndex] || displayImages[0];

  return (
    <div className={`space-y-3 max-w-md mx-auto w-full ${className}`.trim()}>
      {/* Main Large Image Container (Aspect 1:1 Persegi Kotak) */}
      <div className="relative aspect-square w-full bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-inner group transition-all">
        <img
          src={currentImage}
          alt={`${title} - foto ${activeIndex + 1}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Left: DEMO Account Badge */}
        {isDemo && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-xl text-[10.5px] sm:text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-500 shadow-md flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>AKUN DEMO / PERAGA</span>
            </span>
          </div>
        )}

        {/* Bottom Right: Floating Views Badge */}
        {views !== undefined && (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-950/75 text-white backdrop-blur-xs flex items-center gap-1.5 shadow-md border border-white/10">
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>{views} kali dilihat</span>
            </span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 z-20">
            <span className="bg-rose-600 text-white font-extrabold text-xs sm:text-sm uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg">
              BARANG TELAH TERJUAL (SOLD OUT)
            </span>
            <span className="text-xs text-slate-300">
              Iklan ini sudah tidak menerima penawaran baru
            </span>
          </div>
        )}

        {/* Photo Counter indicator if > 1 */}
        {displayImages.length > 1 && !isSold && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md backdrop-blur-xs font-medium pointer-events-none">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex items-center justify-center gap-2.5 pt-1 overflow-x-auto pb-1 scrollbar-none">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onImageSelect(idx)}
              className={`relative w-14 sm:w-16 aspect-square rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                idx === activeIndex
                  ? "border-rose-800 ring-2 ring-rose-300 scale-105"
                  : "border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
