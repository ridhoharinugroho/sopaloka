import React, { useState } from "react";
import { PackageSearch, X } from "lucide-react";
import type { ListingModel } from "../../../domain/listing/listing.contract";
import { ListingGallery } from "./ListingGallery";
import { ListingMetadata, ListingBadges } from "./ListingMetadata";
import { ListingActions } from "./ListingActions";
import { useModalHash } from "../../../hooks/useModalHash";
import { SocialShareModal } from "../../../components/modals/SocialShareModal";

export interface ListingDetailProps {
  listing: ListingModel | null;
  isOpen: boolean;
  activeImageIndex: number;
  onImageSelect: (index: number) => void;
  onClose: () => void;
  onContactClick?: (phone: string, title: string) => void;
  onShareClick?: (listing: ListingModel) => void;
  className?: string;
  isPage?: boolean;
}

export const ListingDetail: React.FC<ListingDetailProps> = ({
  listing,
  isOpen,
  activeImageIndex,
  onImageSelect,
  onClose,
  onContactClick,
  onShareClick,
  className = "",
  isPage = false,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { handleSafeClose } = useModalHash({
    isOpen: Boolean(isOpen && listing && !isPage),
    onClose,
    hash: "detail",
  });

  const handleShare = () => {
    if (onShareClick) {
      onShareClick(listing!);
    } else {
      setIsShareModalOpen(true);
    }
  };

  if (!isOpen || !listing) return null;

  const isDemo = Boolean(
    (listing as unknown as { isDemo?: boolean }).isDemo ||
      listing.id.startsWith("barkas-0") ||
      listing.id.startsWith("demo-") ||
      listing.seller?.id?.includes("demo")
  );
  const isSold = listing.status === "sold";

  const content = (
    <div
      className={`relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col z-10 my-auto ${
        isPage ? "max-h-none border-0 shadow-lg" : "max-h-[90vh] sm:max-h-[92vh]"
      } ${className}`.trim()}
      onClick={(e) => e.stopPropagation()}
    >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/95 sticky top-0 z-20 backdrop-blur-xs">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="p-1.5 bg-rose-900 text-amber-300 rounded-xl shadow-xs shrink-0">
              <PackageSearch className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 text-xs sm:text-sm leading-tight truncate">
                Detail Produk — {listing.title}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">
                Pusat Jual Beli Terdekat — SOPALOKA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleSafeClose}
              aria-label="Tutup Detail"
              className="sr-only"
            >
              Tutup Detail
            </button>
            <button
              type="button"
              onClick={handleSafeClose}
              aria-label="Tutup modal detail"
              className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Body - Clean Mobile-First Vertical Stack */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Badges Row (Identical to Vanilla JS - Above Main Image) */}
          <ListingBadges listing={listing} />

          {/* Gallery Section */}
          <ListingGallery
            images={listing.images}
            title={listing.title}
            activeIndex={activeImageIndex}
            onImageSelect={onImageSelect}
            isDemo={isDemo}
            views={listing.views}
            isSold={isSold}
          />

          {/* Metadata Section (Title, Price, COD, Description, WA Message Preview, Seller Profile) */}
          <ListingMetadata listing={listing} showBadges={false} />
        </div>

        {/* Modal Footer (Side-by-side Horizontal Action Buttons - Sticky at bottom) */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <ListingActions
            listing={listing}
            onContactClick={onContactClick}
            onShareClick={handleShare}
          />
        </div>
        {/* Multi-Level Stacked Share Modal */}
        <SocialShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          listing={listing}
        />
      </div>
  );

  if (isPage) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={handleSafeClose}
      data-testid="listing-detail-modal-overlay"
    >
      {content}
    </div>
  );
};
