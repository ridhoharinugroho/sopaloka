import React from "react";
import { MessageCircle, Share2, X } from "lucide-react";
import type { ListingModel } from "../../../domain/listing/listing.contract";

export interface ListingActionsProps {
  listing: ListingModel;
  onContactClick?: (phone: string, title: string) => void;
  onShareClick?: (listing: ListingModel) => void;
  onClose?: () => void;
  className?: string;
}

export const ListingActions: React.FC<ListingActionsProps> = ({
  listing,
  onContactClick,
  onShareClick,
  onClose,
  className = "",
}) => {
  const handleChat = () => {
    if (onContactClick) {
      onContactClick(listing.seller.phone, listing.title);
      return;
    }
    const cleanPhone = (listing.seller.phone || "").replace(/\D/g, "");
    const targetPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const sellerName = listing.seller.storeName || listing.seller.name || "Penjual";
    const formattedPrice = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(listing.price);
    const msg = encodeURIComponent(
      `Halo ${sellerName}, saya tertarik dengan barang "${listing.title}" seharga ${formattedPrice} di SOPALOKA.\nApakah barang masih tersedia?`
    );
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (onShareClick) {
      onShareClick(listing);
      return;
    }
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Cek barang ${listing.title} di SOPALOKA!`,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Tautan barang berhasil disalin!");
    }
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 w-full ${className}`.trim()}>
      <button
        type="button"
        onClick={handleChat}
        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 sm:py-3 px-3 sm:px-6 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all text-xs sm:text-sm cursor-pointer min-w-0"
      >
        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span className="truncate">Chat Penjual (WhatsApp)</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="shrink-0 flex items-center justify-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 sm:py-3 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
      >
        <Share2 className="w-4 h-4 shrink-0 text-slate-700" />
        <span>Bagikan</span>
      </button>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 shrink-0" />
          <span>Tutup</span>
        </button>
      )}
    </div>
  );
};
