"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Store,
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageCircle,
  Package,
  Star,
  Eye,
  Send,
} from "lucide-react";
import type { ListingModel, ListingSeller } from "../../../domain/listing/listing.contract";
import { getPublicListings } from "../../../services/listingService";
import { mapListingDtoToDomain } from "../../../domain/listing/listing.mapper";
import {
  getSellerReviews,
  getSellerRatingStats,
  addSellerReview,
  type SellerReview,
} from "../../../services/reviewService";
import { getCurrentUser } from "../../../services/authService";
import { useModalHash } from "../../../hooks/useModalHash";
import { ListingDetailView } from "../../listing/components/ListingDetailView";

export interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId?: string;
  seller?: ListingSeller | null;
  onSelectListing?: (listing: ListingModel) => void;
  className?: string;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  isOpen,
  onClose,
  sellerId: propSellerId,
  seller: propSeller,
  onSelectListing,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"items" | "reviews">("items");
  const [sellerListings, setSellerListings] = useState<ListingModel[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ListingModel | null>(null);
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const effectiveSellerId = propSellerId || propSeller?.id || "";

  const { handleSafeClose } = useModalHash({
    isOpen: Boolean(isOpen && effectiveSellerId),
    onClose,
    hash: "profil-toko",
  });

  const { handleSafeClose: handleCloseProduct } = useModalHash({
    isOpen: Boolean(selectedProduct),
    onClose: () => setSelectedProduct(null),
    hash: "detail-barang",
  });

  // Load seller listings and reviews whenever modal opens or seller changes
  useEffect(() => {
    if (!isOpen || !effectiveSellerId) return;

    try {
      const all = getPublicListings().map((item: any) =>
        "negoType" in item ? (item as ListingModel) : mapListingDtoToDomain(item)
      );
      const filtered = all.filter(
        (item) => item.seller?.id === effectiveSellerId || (item as any).seller_id === effectiveSellerId
      );
      setSellerListings(filtered);
    } catch {
      setSellerListings([]);
    }

    try {
      const sellerRevs = getSellerReviews(effectiveSellerId);
      setReviews(sellerRevs);
    } catch {
      setReviews([]);
    }

    setActiveTab("items");
    setSelectedProduct(null);
    setReviewError(null);
    setReviewSuccess(null);
  }, [isOpen, effectiveSellerId]);

  // Derived seller info
  const resolvedSeller: ListingSeller = useMemo(() => {
    if (propSeller && (propSeller.storeName || propSeller.name)) {
      return propSeller;
    }
    if (sellerListings.length > 0 && sellerListings[0].seller) {
      return sellerListings[0].seller;
    }
    return {
      id: effectiveSellerId,
      name: propSeller?.name || "Penjual",
      storeName: propSeller?.storeName || propSeller?.name || "Toko Penjual",
      phone: propSeller?.phone || "081234567890",
      avatar: propSeller?.avatar || null,
    };
  }, [propSeller, sellerListings, effectiveSellerId]);

  const ratingStats = useMemo(() => {
    if (!effectiveSellerId) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    return getSellerRatingStats(effectiveSellerId);
  }, [effectiveSellerId, reviews]);

  const activeCount = sellerListings.filter((l) => l.status === "active").length;
  const soldCount = sellerListings.filter((l) => l.status === "sold").length;
  const displayName = resolvedSeller.storeName || resolvedSeller.name || "Toko Penjual";
  const initial = displayName.charAt(0).toUpperCase();

  // WhatsApp Link generator
  const cleanPhone = (resolvedSeller.phone || "081234567890").replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  const waMessage = encodeURIComponent(
    `Halo ${displayName}, saya melihat profil toko Anda di SOPALOKA. Ingin menanyakan barang jualan Anda. Terima kasih!`
  );
  const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${waMessage}`;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSafeClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleSafeClose]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    const currentUser = getCurrentUser();
    if (!currentUser) {
      setReviewError("Silakan masuk (login) terlebih dahulu untuk menulis ulasan.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Tuliskan ulasan atau pengalaman transaksi Anda.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Sesuai sistem ulasan, gunakan gambar produk pertama penjual sebagai bukti referensi
      const sampleProductImage = sellerListings[0]?.images?.[0] || "https://via.placeholder.com/150";
      await addSellerReview({
        sellerId: effectiveSellerId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        productImage: sampleProductImage,
      });

      setReviewSuccess("Terima kasih! Ulasan Anda berhasil dikirim.");
      setReviewComment("");
      setReviews(getSellerReviews(effectiveSellerId));
    } catch (err: any) {
      setReviewError(err?.message || "Gagal mengirim ulasan.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!isOpen || !effectiveSellerId) return null;

  return (
    <div
      id="modal-seller-profile"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={handleSafeClose}
    >
      <div
        className={`relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 border border-slate-100 ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-900 rounded-xl text-amber-300 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm sm:text-base text-white">
                Profil Toko & Penjual
              </h3>
              <p className="text-xs text-slate-400">Komunitas Jual Beli Terpercaya Solo Raya</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSafeClose}
            aria-label="Tutup Profil Penjual"
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Seller Info Card Header */}
          <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
              {resolvedSeller.avatar ? (
                <img
                  id="seller-profile-avatar"
                  src={resolvedSeller.avatar}
                  alt={displayName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md flex-shrink-0"
                />
              ) : (
                <div
                  id="seller-profile-avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-rose-700 to-amber-600 border-2 border-amber-400 text-white font-heading font-bold text-2xl flex items-center justify-center shadow-md flex-shrink-0"
                >
                  {initial}
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="seller-profile-name"
                    className="font-heading font-black text-lg sm:text-xl text-white truncate"
                  >
                    {displayName}
                  </h2>
                  <span
                    id="seller-profile-badge"
                    className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span id="seller-profile-badge-text">Toko Lokal Solo Terverifikasi</span>
                  </span>
                </div>

                <p id="seller-profile-bio" className="text-xs text-slate-300 line-clamp-2">
                  Pusat jual beli barang bekas amanah dan terpercaya di Solo Raya. Pantau cocok bayar!
                </p>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-rose-200 pt-1">
                  <span id="seller-profile-region" className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>Solo Raya</span>
                  </span>
                  <span>•</span>
                  <span id="seller-profile-created" className="flex items-center gap-1 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Penjual Terdaftar</span>
                  </span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <a
                id="seller-profile-wa-btn"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Toko WA</span>
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-white/10 text-center relative z-10">
              <div className="bg-white/5 rounded-xl p-2">
                <div id="seller-stat-active" className="font-heading font-black text-sm sm:text-base text-amber-300">
                  {activeCount}
                </div>
                <div className="text-[10px] text-slate-300">Iklan Aktif</div>
              </div>
              <div className="bg-white/5 rounded-xl p-2">
                <div id="seller-stat-sold" className="font-heading font-black text-sm sm:text-base text-emerald-400">
                  {soldCount}
                </div>
                <div className="text-[10px] text-slate-300">Terjual</div>
              </div>
              <div
                id="seller-stat-rating"
                onClick={() => setActiveTab("reviews")}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2 cursor-pointer"
                title="Klik untuk melihat ulasan toko"
              >
                <div className="font-heading font-black text-sm sm:text-base text-amber-300 flex items-center justify-center gap-0.5">
                  <span>{ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : "5.0"}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                </div>
                <div className="text-[10px] text-slate-300">Rating Toko</div>
              </div>
              <div
                id="seller-stat-reviews"
                onClick={() => setActiveTab("reviews")}
                className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2 cursor-pointer"
                title="Klik untuk melihat ulasan toko"
              >
                <div className="font-heading font-black text-sm sm:text-base text-white">
                  {reviews.length}
                </div>
                <div className="text-[10px] text-slate-300">Total Ulasan</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs: Barang Jualan vs Ulasan */}
          <div className="flex items-center border-b border-slate-200 gap-4">
            <button
              type="button"
              id="tab-btn-seller-items"
              onClick={() => setActiveTab("items")}
              className={`pb-2.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "items"
                  ? "text-rose-900 border-b-2 border-rose-900"
                  : "text-slate-400 hover:text-slate-700 border-b-2 border-transparent"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>
                Daftar Barang Jualan (<span id="seller-tab-items-count">{sellerListings.length}</span>)
              </span>
            </button>
            <button
              type="button"
              id="tab-btn-seller-reviews"
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "text-rose-900 border-b-2 border-rose-900"
                  : "text-slate-400 hover:text-slate-700 border-b-2 border-transparent"
              }`}
            >
              <Star className="w-4 h-4" />
              <span>
                Ulasan & Rating (<span id="seller-tab-reviews-count">{reviews.length}</span>)
              </span>
            </button>
          </div>

          {/* Panel 1: Seller's Listings */}
          {activeTab === "items" && (
            <div id="seller-tab-panel-items" className="space-y-3 animate-fade-in">
              {sellerListings.length === 0 ? (
                <div id="seller-listings-empty" className="py-10 text-center space-y-2 bg-slate-50 rounded-2xl">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Belum ada barang jualan pada toko ini</p>
                  <p className="text-xs text-slate-500">Penjual belum memasang iklan barang baru.</p>
                </div>
              ) : (
                <div id="seller-listings-container" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sellerListings.map((item) => {
                    const formattedPrice = new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(item.price);

                    const mainImage =
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : "https://via.placeholder.com/150?text=SOPALOKA";

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (onSelectListing) {
                            onSelectListing(item);
                          }
                          setSelectedProduct(item);
                        }}
                        className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                      >
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2">
                          <img
                            src={mainImage}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                item.status === "sold"
                                  ? "bg-rose-900 text-white"
                                  : "bg-emerald-600 text-white"
                              }`}
                            >
                              {item.status === "sold" ? "Terjual" : "Tersedia"}
                            </span>
                            {item.isBu && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                                BU
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-heading font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight mb-1">
                          {item.title}
                        </h4>

                        <div className="mt-auto pt-1">
                          <p className="font-heading font-bold text-xs sm:text-sm text-rose-800">
                            {formattedPrice}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3" />
                            <span>{item.views || 0}x dilihat</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Panel 2: Seller's Reviews */}
          {activeTab === "reviews" && (
            <div id="seller-tab-panel-reviews" className="space-y-5 animate-fade-in">
              {/* Rating Summary Box (Sesuai Vanilla JS) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center sm:border-r sm:border-slate-200 sm:pr-6 flex-shrink-0">
                  <div id="seller-rating-score" className="text-3xl sm:text-4xl font-heading font-black text-slate-900">
                    {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : "5.0"}
                  </div>
                  <div id="seller-rating-stars" className="flex items-center justify-center gap-1 text-amber-400 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div id="seller-rating-count-text" className="text-[11px] text-slate-500 font-semibold">
                    Berdasarkan {reviews.length} ulasan
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((starNum) => {
                    const count = ratingStats.ratingCounts?.[starNum] || 0;
                    const total = ratingStats.totalReviews || 1;
                    const percent =
                      ratingStats.totalReviews > 0
                        ? Math.round((count / total) * 100)
                        : starNum === 5
                        ? 100
                        : 0;
                    return (
                      <div key={starNum} className="flex items-center gap-2">
                        <span className="w-8 font-bold text-slate-600">{starNum} ★</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-400 h-2 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-slate-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Submit Form */}
              <form
                onSubmit={handleSubmitReview}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                    Beri Ulasan untuk {displayName}
                  </h4>
                  {/* Star rating selector */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        aria-label={`Beri bintang ${star}`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= reviewRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {reviewError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
                    {reviewSuccess}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman transaksi atau kondisi barang yang Anda beli dari penjual ini..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                  Semua Ulasan Pembeli ({reviews.length})
                </h4>

                {reviews.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    Belum ada ulasan pembeli untuk toko ini. Jadilah yang pertama memberikan ulasan!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.buyerAvatar || "https://via.placeholder.com/150"}
                            alt={rev.buyerName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="font-bold text-xs text-slate-800">{rev.buyerName}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3.5 h-3.5 ${
                                idx < rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Level Stacked Product Detail Modal for Items in Etalase */}
      {selectedProduct && (
        <div
          id="modal-etalase-item-detail"
          className="fixed inset-0 z-[10020] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
          onClick={handleCloseProduct}
          data-testid="etalase-item-detail-modal-overlay"
        >
          <ListingDetailView
            listing={selectedProduct}
            onClose={handleCloseProduct}
            onBack={handleCloseProduct}
            backLabel="Kembali ke Profil Toko"
            onViewSellerProfile={handleCloseProduct}
          />
        </div>
      )}
    </div>
  );
};
