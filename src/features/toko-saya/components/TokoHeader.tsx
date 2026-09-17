import React from "react";
import { PlusCircle, CheckCircle } from "lucide-react";
import type { RegisteredUser } from "../../../services/authService";

export interface SellerInfo {
  name?: string;
  avatar?: string;
  location?: string;
  phone?: string;
  createdAt?: string;
}

export interface TokoHeaderProps {
  user?: RegisteredUser | null;
  sellerInfo?: SellerInfo;
  soldCount?: number;
  onCreateListingClick?: () => void;
  className?: string;
}

export const TokoHeader: React.FC<TokoHeaderProps> = ({
  user,
  sellerInfo,
  soldCount = 0,
  onCreateListingClick,
  className = "",
}) => {
  const storeName = user?.storeName || user?.name || sellerInfo?.name || "Toko Penjual";
  const location = user?.district
    ? `${user.region || "Solo"} • ${user.district}`
    : user?.region || sellerInfo?.location || "-";
  const phone = user?.phone || sellerInfo?.phone || "-";
  const created = user?.createdAt || sellerInfo?.createdAt || "-";
  const avatarSrc = user?.avatar || sellerInfo?.avatar;
  const initial = storeName.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl border border-white/10 relative overflow-hidden ${className}`.trim()}
    >
      {/* Decorative Background Glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {avatarSrc ? (
            <img
              id="my-store-avatar"
              src={avatarSrc}
              alt={storeName}
              className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] rounded-2xl object-cover border-2 border-amber-400 flex-shrink-0 shadow-lg"
            />
          ) : (
            <div
              id="my-store-avatar"
              className="w-14 h-14 sm:w-16 sm:h-16 min-w-[56px] min-h-[56px] rounded-2xl bg-gradient-to-br from-rose-700 to-amber-600 border-2 border-amber-400 text-white font-heading font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            >
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-0.5">
            <h1 id="my-store-name" className="font-heading font-bold text-lg sm:text-xl text-white truncate leading-snug">
              {storeName}
            </h1>
            <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-x-2.5 gap-y-0.5 flex-wrap leading-tight">
              <span id="my-store-location" className="font-semibold text-slate-200">
                {location}
              </span>
              <span id="my-store-phone" className="text-emerald-400 font-semibold">
                {phone}
              </span>
              <span id="my-store-created" className="text-amber-300 font-semibold">
                {created}
              </span>
              {/* Highlight Tag: Jumlah Barang Terjual */}
              <span
                id="my-store-sold-tag"
                className="bg-rose-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-400/40 text-xs flex items-center gap-1 shadow-xs"
              >
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span id="my-store-sold-count-text">{soldCount} Terjual</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Pasang Iklan hanya di-render bila onCreateListingClick tersedia (Pure React conditional) */}
        {onCreateListingClick && (
          <div className="flex items-center gap-2 flex-shrink-0 relative z-30 pointer-events-auto">
            <button
              type="button"
              id="btn-store-create-listing"
              onClick={onCreateListingClick}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer relative z-30 pointer-events-auto hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Pasang Iklan</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

