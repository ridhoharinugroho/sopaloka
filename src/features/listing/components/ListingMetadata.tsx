import React, { useState, useEffect } from "react";
import {
  Tag,
  Handshake,
  Store,
  MapPin,
  Sparkles,
  Clock,
  XCircle,
  CheckCircle2,
  BadgePercent,
  AlertCircle,
  QrCode,
  Heart,
  FileText,
  ShieldCheck,
  Star,
  Calendar,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import { isFavorite as checkIsFavorite, toggleFavorite } from "../../../services/listingService";
import { getRegionById } from "../../../lib/regions";

export interface ListingMetadataProps {
  listing: ListingModel;
  showBadges?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "Semua Kategori",
  elektronik: "Elektronik & Gadget",
  kendaraan: "Kendaraan & Otomotif",
  perabot: "Perabot & Rumah Tangga",
  pakaian: "Pakaian & Aksesoris",
  kuliner: "Makanan & Minuman",
  "bayi-anak": "Perlengkapan Bayi & Anak",
  pertukangan: "Pertukangan & Bangunan",
  hobi: "Hobi, Musik & Olahraga",
  hewan: "Hewan & Perlengkapan",
  "alat-sekolah": "Peralatan Sekolah",
  "perawatan-diri": "Perawatan Diri",
  properti: "Properti",
  jasa: "Jasa",
  lainnya: "Lain-lain / Aneka",
};

const CONDITION_LABELS: Record<string, string> = {
  new: "Baru / Segel",
  like_new: "Seperti Baru",
  good: "Kondisi Bagus",
  used: "Bekas Normal",
  minus: "Ada Minus",
};

const NEGO_LABELS: Record<string, string> = {
  pass: "Harga Pas",
  pas: "Harga Pas",
  nego_alus: "Nego Alus",
  nego_tipis: "Nego Tipis",
  nego: "Bisa Nego",
  free: "Gratis",
};

function formatNegoLabel(negoType?: string | null): string {
  if (!negoType) return "Bisa Nego";
  const lower = negoType.toLowerCase().trim();
  if (NEGO_LABELS[lower]) return NEGO_LABELS[lower];
  return lower
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "Baru saja";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "Baru saja";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} hari lalu`;
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "Baru saja";
  }
}

function formatJoinedDate(dateStr?: string | null): string {
  if (!dateStr) return "2026";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  } catch {
    return "2026";
  }
}

/**
 * 1. Deretan Badge Ikonik (Kategori, COD, Wilayah, Status, Kondisi, Nego, BU, QRIS)
 * Diletakkan di bagian paling atas modal detail sebelum foto utama.
 */
export const ListingBadges: React.FC<{ listing: ListingModel; className?: string }> = ({
  listing,
  className = "",
}) => {
  const regionObj = getRegionById(listing.regencyCode || listing.regionId);
  const regionName = regionObj?.shortName || regionObj?.name || listing.regionId || "Solo Raya";
  const locSnippet = listing.district ? `${regionName} • ${listing.district}` : regionName;
  const itemStatus = listing.status || "active";
  const categoryLabel = CATEGORY_LABELS[listing.category?.toLowerCase()] || listing.category || "Barang";
  const conditionLabel = CONDITION_LABELS[listing.condition?.toLowerCase()] || listing.condition || "Bekas";
  const negoLabel = formatNegoLabel(listing.negoType);
  const isStore = listing.paymentMethod === "in_store";

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${className}`.trim()}>
      {/* 1. Kategori Badge */}
      <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-rose-800" />
        <span>{categoryLabel}</span>
      </span>

      {/* 2. Metode Transaksi (COD / In Store) */}
      {isStore ? (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold shadow-2xs border flex items-center gap-1.5 bg-sky-50 text-sky-800 border-sky-300">
          <Store className="w-3.5 h-3.5 text-sky-700" />
          <span>Ambil di Toko</span>
        </span>
      ) : (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold shadow-2xs border flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300">
          <Handshake className="w-3.5 h-3.5 text-emerald-700" />
          <span>COD</span>
        </span>
      )}

      {/* 3. Lokasi Wilayah & Kecamatan */}
      <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-rose-700" />
        <span>{locSnippet}</span>
      </span>

      {/* 4. Status Ketersediaan */}
      {itemStatus === "sold" ? (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>Terjual</span>
        </span>
      ) : itemStatus === "booked" ? (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Booked</span>
        </span>
      ) : (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tersedia</span>
        </span>
      )}

      {/* 5. Kondisi Barang */}
      <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
        <span>{conditionLabel}</span>
      </span>

      {/* 6. Tipe Nego */}
      <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs flex items-center gap-1.5">
        <BadgePercent className="w-3.5 h-3.5 text-amber-700" />
        <span>{negoLabel}</span>
      </span>

      {/* 7. BU (Butuh Uang) Badge */}
      {listing.isBu && (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1.5 animate-pulse">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>BU (Butuh Uang)</span>
        </span>
      )}

      {/* 8. QRIS Terverifikasi Badge */}
      {listing.isQrisVerified && (
        <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-indigo-600" />
          <span>QRIS Terverifikasi</span>
        </span>
      )}
    </div>
  );
};

export const ListingMetadata: React.FC<ListingMetadataProps> = ({
  listing,
  showBadges = true,
  className = "",
}) => {
  const [isFav, setIsFav] = useState<boolean>(() => checkIsFavorite(listing.id));
  const [copiedWa, setCopiedWa] = useState<boolean>(false);

  useEffect(() => {
    setIsFav(checkIsFavorite(listing.id));
  }, [listing.id]);

  const handleFavoriteClick = async () => {
    const nextState = await toggleFavorite(listing.id);
    setIsFav(nextState);
  };

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(listing.price);

  const regionObj = getRegionById(listing.regencyCode || listing.regionId);
  const regionName = regionObj?.shortName || regionObj?.name || listing.regionId || "Solo Raya";
  const locationDisplay = [
    listing.village,
    listing.district,
    listing.regionId !== "all" ? listing.regionId : null,
  ]
    .filter(Boolean)
    .join(", ") || regionName;

  const isDemo = Boolean(
    (listing as unknown as { isDemo?: boolean }).isDemo ||
      listing.id.startsWith("barkas-0") ||
      listing.id.startsWith("demo-") ||
      listing.seller?.id?.includes("demo")
  );
  const isStore = listing.paymentMethod === "in_store";

  const waMessagePreview = `Halo ${listing.seller.storeName || listing.seller.name || "Penjual"}, saya tertarik dengan barang "${listing.title}" seharga ${formattedPrice} di SOPALOKA.\nApakah barang masih tersedia?`;

  const handleCopyWaMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(waMessagePreview);
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    }
  };

  return (
    <div className={`space-y-4 text-slate-800 ${className}`.trim()}>
      {/* Jika showBadges aktif (fallback unit test), render di sini */}
      {showBadges && <ListingBadges listing={listing} />}

      {/* ─── 2. TITLE, HARGA & TOMBOL FAVORIT ─── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {listing.title}
          </h1>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`p-2.5 rounded-2xl border transition-colors shadow-xs cursor-pointer flex-shrink-0 ${
              isFav
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            }`}
            title={isFav ? "Hapus dari favorit" : "Simpan ke favorit"}
            aria-label="Favoritkan barang"
          >
            <Heart className={`w-5 h-5 ${isFav ? "fill-rose-600 text-rose-600" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 tracking-tight">
            {formattedPrice}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimeAgo(listing.createdAt)}</span>
          </span>
        </div>
      </div>

      {/* ─── 3. TITIK / PATOKAN LOKASI COD ─── */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 shadow-2xs">
        <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 flex-shrink-0">
          {isStore ? <Store className="w-5 h-5" /> : <Handshake className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
            {isStore ? "Lokasi Toko / Ambil di Tempat" : "Titik / Patokan Lokasi COD"}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
            {listing.codPoint || `Area ${locationDisplay} (Bisa janjian via WhatsApp)`}
          </div>
          {listing.storeMapsUrl && (
            <div className="mt-2">
              <a
                href={listing.storeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Lokasi Toko (Google Maps)</span>
                <ExternalLink className="w-3 h-3 text-sky-200" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ─── 4. DESKRIPSI LENGKAP PRODUK ─── */}
      {listing.description && (
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-900" />
            <span>Deskripsi Lengkap Barang</span>
          </h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 font-normal">
            {listing.description}
          </div>
        </div>
      )}

      {/* ─── 5. CARD PROFIL PENJUAL & TOKO ─── */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Profil Penjual & Toko</span>
          {isDemo ? (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 border border-amber-500 text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full shadow-2xs">
              <Tag className="w-3 h-3" />
              <span>AKUN DEMO / PERAGA</span>
            </span>
          ) : (
            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Toko Lokal Terverifikasi</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md flex-shrink-0 bg-rose-100 text-rose-800 font-black text-xl flex items-center justify-center overflow-hidden">
            {listing.seller.avatar ? (
              <img
                src={listing.seller.avatar}
                alt={listing.seller.name || "Penjual"}
                className="w-full h-full object-cover"
              />
            ) : (
              (listing.seller.storeName || listing.seller.name || "S").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-black text-slate-900 text-base sm:text-lg truncate">
              {listing.seller.storeName || listing.seller.name || "Penjual Terverifikasi"}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
              <div className="flex items-center gap-1 font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>5.0 (Ulasan Terpercaya)</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{locationDisplay}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Bergabung sejak {formatJoinedDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Tombol Kunjungi Profil Toko Penjual */}
        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-slate-500 font-medium">
            Lihat seluruh barang dagangan & reputasi penjual
          </span>
          <button
            type="button"
            onClick={() => {
              if (listing.seller?.id) {
                window.location.href = `/toko-saya?seller=${encodeURIComponent(listing.seller.id)}`;
              }
            }}
            id="btn-view-seller-profile"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Kunjungi Profil Toko</span>
          </button>
        </div>
      </div>

      {/* ─── 6. WHATSAPP MESSAGE PREVIEW ─── */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Pratinjau Pesan Otomatis WhatsApp</span>
          </span>
          <button
            type="button"
            onClick={handleCopyWaMessage}
            id="btn-copy-wa-message"
            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{copiedWa ? "Tersalin!" : "Salin Teks"}</span>
          </button>
        </div>
        <div
          id="detail-wa-preview-text"
          className="text-xs text-emerald-950/90 font-mono bg-white p-3 rounded-xl border border-emerald-200/80 whitespace-pre-line leading-relaxed select-all"
        >
          {waMessagePreview}
        </div>
      </div>
    </div>
  );
};
